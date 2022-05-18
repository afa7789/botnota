import app from './library/express/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.listen(PORT,()=>{
//   console.log('Example app listening on port http://localhost:' + PORT);
// })

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

// getting data
async function getData() {
  const data = await axios
    .get('https://botnota.herokuapp.com/clients')
    .then((res) =>
      res.data.data.map((elem) => [elem[1], elem[0]])
    );
  return data
}

bot.command('/start',
  async (ctx) => {
    ctx.reply('Vamos começar?');
    const data = await getData()
    const inline_button = Markup.keyboard(
      data.map((el) => [Markup.button.callback(el[0], el[1])])
    ).oneTime()
    console.log(ctx.message.chat.username)
    ctx.session = {}
    ctx.session.state = 0;
    ctx.session.timestamp = Date.now()
    ctx.reply(
      'Escolha um dos clientes abaixo',
      inline_button,
    );
  }
)

async function onState0(ctx) {
  let client_id = null;
  const data = await getData()
  data.every(el => {
    if (el[0] == ctx.message.text) {
      ctx.session.state = 1;
      client_id = el[1];
      return false;
    }
    return true;
  })
  if (client_id != null) {
    Markup.removeKeyboard();
    Markup.keyboard([])
    ctx.session.client_id = client_id;
    ctx.reply('Recebi o client e guardei na sessão seu id = '+client_id)
    ctx.reply('Qual o valor da Nota Fiscal?')
  } else {
    ctx.session=null
    ctx.reply('Dado que foi entrado, não foi possível de ser processado, use /start novamente.')
  }
}

function onState1(ctx) {
  const float  = parseFloat(ctx.message.text)
  if ( float == NaN ){
    console.log("nao responder:", ctx.message.text, float)
    ctx.reply('Não é um valor válido.')
  }else{
    console.log("nao responder:", ctx.message.text, float)
    ctx.reply('Qual o seu email ? Para enviarmos a nota fiscal')
  }
}

function onState2(ctx){

}

bot.on('text',async (ctx) => {
  const unixTime = Math.floor(Date.now() / 1000);
  if( unixTime - ctx.session.timestamp > 360 ) // 6 min
    ctx.session = null
  // log the text
  switch (ctx.session.state) {
    case 0:
      await onState0(ctx);
      break;
    case 1:
      onState1(ctx);
      break;
    case 1:
      onState2(ctx);
      break;
    default:
      return;
  }
})

bot.launch()

// >> Começar, escolha um cliente:
// aparece botões, clica em um

// >> Escolha um produto
// aparece botões clica em um

// >> Escolha uma quantidade
// recebe texto

// >> Quer Adicionar mais um produto ?
// [sim],[nao],[cancelar nota]
//  sim volta, não continua

// >> Qual seu email ?
// recebe email e faz regex de teste

// >> Deu certo , envia POST request, backend faz as mutretas
