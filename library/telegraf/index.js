import 'dotenv/config';
import axios from 'axios';
import { Telegraf, Markup } from 'telegraf';
import LocalSession from 'telegraf-session-local'

//Setting the bot
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log('Response time: %sms', ms)
})
bot.use((new LocalSession({ database: 'example_db.json' })).middleware())

// getting data get clients
async function getData() {
    const data = await axios
        .get('https://botnota.herokuapp.com/clients')
        .then((res) =>
            res.data.items.map(
                (elem) => [elem[1], elem[0]]
            )
        );
    return data
}

async function postAuth(string) {
    const data = await axios
        .post(
            'https://botnota.herokuapp.com/auth',
            {
                pass: string
            }
        )
        .then((res) => {
            return res.data
        });
    return data
}

// getting data get products
async function getData2() {
    const data = await axios
        .get('https://botnota.herokuapp.com/products')
        .then((res) =>
            res.data.items.map(
                // name
                // id
                // price
                (elem) => [elem[1], elem[0], elem[2]]
            )
        );
    return data
}

bot.command('/start',
    async (ctx) => {
        ctx.reply('Emissor de Nota Fiscal da VLub');
        ctx.session.state = 0;
    }
)

// escolhe produto
async function ChooseAProduct(ctx) {
    const data = await getData2()
    const inline_button = Markup.keyboard(
        data.map((el) => [Markup.button.callback(el[0], el[1])])
    ).oneTime()
    ctx.reply(
        'Escolha um dos produtos abaixo',
        inline_button,
    );
}

// outro produto ?
function anotherProduct(ctx) {

    const inline_button = Markup.inlineKeyboard([
        Markup.button.callback("sim", "another_product"),
        Markup.button.callback("não", "close_nota"),
        Markup.button.callback("cancelar", "cancel")
    ]);
    console.log("sessao", ctx.session)
    ctx.reply(
        'Vai querer adicionar mais um produto?',
        inline_button,
    );
}

// recebe um texto e autentifica
async function onState0(ctx) {
    try {
        const auth = await postAuth(ctx.message.text)
        if (auth.status) {
            const data = await getData()
            const inline_button = Markup.keyboard(
                data.map((el) => [Markup.button.callback(el[0], el[1])])
            ).oneTime()
            ctx.session.user = ctx.message.chat.username
            ctx.session.name = ctx.message.chat.first_name
            ctx.session = {}
            ctx.session.state = 1;
            ctx.session.timestamp = Date.now()
            ctx.reply(
                'Acesso Liberado.\nEscolha um dos clientes abaixo',
                inline_button,
            );
        } else {
            ctx.reply("Não, você precisa de escrever a chave de acesso.")
            console.log("not available at login")
        }
    } catch (e) {
        console.log("error atuh", e)
    }
}

// recebe o cliente, e pede produto
async function onState1(ctx) {
    let client_id = null;
    const data = await getData()
    data.every(el => {
        if (el[0] == ctx.message.text) {
            client_id = el[1];
            return false;
        }
        return true;
    })
    if (client_id != null) {
        ctx.session.state = 2;
        Markup.removeKeyboard();
        Markup.keyboard([])
        ctx.session.client_id = client_id;
        ctx.reply('Recebi o client e guardei na sessão seu id = ' + client_id)
        await ChooseAProduct(ctx)
    } else {
        ctx.session = null
        ctx.reply('Dado que foi entrado, não foi possível de ser processado, use /start novamente.')
    }
}

// recebe produto e pede quantidade
async function onState2(ctx) {
    // set data to be filles, and fetch it
    let product_id = null;
    let product_price = null
    ctx.session.set ? null : ctx.session.set = {};
    let product_name = ctx.message.text
    const data = await getData2()
    data.every(el => {
        if (el[0] == product_name) {
            product_id = el[1];
            product_price = el[2];
            return false;
        }
        return true;
    });

    // check it
    if (product_id != null) {
        ctx.session.state = 3;
        ctx.session.set[product_id] ? null : ctx.session.set[product_id] = {
            name: product_name,
            price: product_price,
            quantity: 0,
            id: product_id,
        };

        Markup.removeKeyboard();
        Markup.keyboard([])
        ctx.session.last_product = product_id;
        ctx.reply("Quanto do produto " + product_name + " vai ser adicionado a nota?");
    } else {
        ctx.session = null
        ctx.reply('Dado que foi entrado, não foi possível de ser processado, use /start novamente.')
    }
}

// recebe quantidade e mostra botões para adicionar mais ou proseguir.
async function onState3(ctx) {
    const quantity = parseInt(ctx.message.text);
    if (quantity == NaN) {
        console.log("nao responder:", ctx.message.text, quantity);
        ctx.reply('Não é uma quantidade válida. Entre com um valor inteiro.');
    } else {
        console.log("state=null:", ctx.message.text, quantity);
        let last_product = ctx.session.last_product
        ctx.session.set[last_product].quantity += quantity
        anotherProduct(ctx);
        ctx.session.state = 4;
    }
}

bot.on('text', async (ctx) => {
    const unixTime = Math.floor(Date.now() / 1000);
    if (unixTime - ctx.session.timestamp > 360) // 6 min
        ctx.session = null;
    // log the text
    switch (ctx.session.state) {
        case 0:
            await onState0(ctx);
            break;
        case 1:
            await onState1(ctx);
            break;
        case 2:
            await onState2(ctx);
            break;
        case 3:
            await onState3(ctx);
            break;
        default:
            return;
    }
})

bot.action("another_product", async (ctx) => {
    if (ctx.session?.state == 4) {
        // muda o state pare receber produto
        ctx.session.state = 2;
        // call choose a product
        ChooseAProduct(ctx);
        console.log("another product");
    }
});

bot.action("close_nota", async (ctx) => {
    if (ctx.session?.state == 4) {
        console.log("Encerrar nota, tem que chamar backend aqui");
        console.log("sessao", ctx.session, "\n");
        // construir o corpo para ser enviado.
        const post_body = {
            client_id: ctx.session.client_id,
            emitter: ctx.session.name + " " + ctx.session.user,
            set: Object.values(ctx.session.set)
        }

        try {
            // console.log('post_body',post_body);
            // esperar resposta de uma api.
            const data = await axios.post('https://botnota.herokuapp.com/nota_fiscal',
                post_body
            ).then((res) => {
                return res.data;
            });

            // responder no chat de acordo com resultado
            // queria receber um arquivo da nota fiscal
            if (data.status) {
                ctx.reply("Nota fiscal gerada");

                // ctx.replyWithDocument()

                // ctx.telegram.sendDocument(ctx.from.id, {
                //     url: data.url
                //     filename: data.filename,
                //  }).catch(function(error){ console.log(error); })

            } else {
                ctx.reply("Erro");
            }
        } catch (e) {
            console.log("e", e)
        }
    }
});

bot.action("cancel", (ctx) => {
    if (ctx.session?.state == 4) {
        ctx.session = null;
        ctx.reply('Os dados da nota foram removidos do bot.\nPara usar novamente digite /start');
    }
})

export default bot