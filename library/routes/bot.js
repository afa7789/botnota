import { MailSender } from "../email/mail.js";
import {createSuccessEmail, createErrorEmail, createReportErrorEmail} from '../email/craft_mail.js'
import { VHSYS, ACCESS_TOKEN, SECRET_ACCESS_TOKEN } from '../../utils/constants.js'
import express from 'express';
import axios from 'axios';
const ms = new MailSender();

var bot_routes = express.Router()

bot_routes.get('/clients', async (request, response) => {
    //     const body = request.body
    try {
        const answer = await axios.get(VHSYS + 'v2/clientes?limit=250', {
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'access-token': ACCESS_TOKEN,
                'secret-access-token': SECRET_ACCESS_TOKEN,
            }
        }).then((resolve) => {
            return resolve.data.data.map(el => {
                return [
                    el.id_cliente,
                    el.fantasia_cliente ? el.fantasia_cliente : el.razao_cliente
                ]
            }).sort((first, second) => first[0] - second[0]);
        }).catch((e) => {
            console.log(e)
            throw e
        })

        // return the qrcode , image and transaction id I think.
        return response.json({
            status: true,
            items: answer,
        });
    } catch (e) {
        console.log("e", e)
        return response.status(400).json({
            status: false,
        });
    }
})

bot_routes.get('/products', async (request, response) => {
    //     const body = request.body
    try {
        const answer = await axios.get(VHSYS + 'v2/produtos?limit=250', {
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'access-token': ACCESS_TOKEN,
                'secret-access-token': SECRET_ACCESS_TOKEN,
            }
        }).then((resolve) => {
            return resolve.data.data.filter(el => {
                return parseFloat(el.valor_produto) > 0
            }).map(el => {
                return [
                    el.id_produto,
                    el.cod_produto,
                    el.valor_produto
                ]
            }).sort((first, second) => first[0] - second[0]);

        }).catch((e) => {
            console.log(e)
            throw e
        })

        // return the qrcode , image and transaction id I think.
        return response.json({
            status: true,
            items: answer,
        });

    } catch (e) {
        console.log("e", e)
        return response.status(400).json({
            status: false,
        });
    }
})

async function GetClient(client_id){
    return await axios.get(VHSYS + 'v2/clientes/'+client_id, {
        headers: {
            'content-type': 'application/json',
            'cache-control': 'no-cache',
            'access-token': ACCESS_TOKEN,
            'secret-access-token': SECRET_ACCESS_TOKEN,
        }
    }).then((resolve) => {
        return resolve.data
    }).catch((e) => {
        console.log(e)
        throw e
    })
}

/*
    -d '{
        "serie_nota" : 1234,
        "id_cliente" : 123456,
        "nome_cliente" : "Nome do cliente",
        "vendedor_pedido" : "Nome do vendedor",
        "vendedor_pedido_id" : 123456,
        "desconto_pedido" : "0.00",
        "peso_total_nota" : "0.00",
        "peso_total_nota_liq" : "0.00",
        "frete_pedido" : "0.00",
        "valor_baseICMS" : "0.00",
        "valor_ICMS" : "0.00", // 12%
        "valor_despesas" : "0.00",
        "transportadora_pedido" : "Nome da transportadora",
        "id_transportadora" : 123456,
        "frete_por_pedido" : 1,
        "volumes_transporta" : 1,
        "especie_transporta" : "Caixa",
        "marca_transporta" : "Marca do volume",
        "numeracao_transporta" : 123,
        "placa_transporta" : "AAA-0000",
        "natureza_pedido" : "Natureza da operação",
        "cfop_pedido" : "5101",
        "obs_pedido" : "Observação", // relação  nome | quantidade | preço | preço total
        "obs_interno_pedido" : "Observação interna",
        "status_pedido" : "Em Aberto",
        "indPres_pedido": 9,
        "ambiente" : 2
    }'
*/
bot_routes.post('/nota_fiscal', async (request, response) => {
    // data received
    let set = request.body.set;
    let id_cliente = request.body.client_id;
    let emissor = request.body.emitter;

    const cliente = await GetClient(id_cliente);
    // console.log("cliente",cliente);
    const email_equipe = "afa7789@gmail.com";

    // montar observação
    let obs_message = "nome\t|\tquantidade\t|\tpreço\t|\tpreço total";
    let total_sum = 0;
    set.forEach((el)=>{
        // name: '500B4QT', price: '405.530000', quantity: 300 
        let price = parseFloat(el.price);
        let item_total = price*el.quantity;
        total_sum += item_total;
        obs_message += `${el.name}\t|\t${el.quantity}\t|\t${price}\t|\t${item_total}\n`;
    });
    obs_message += `\t \t|\t \t|\t \t|\t ${total_sum}`;

    // contruir o body
    const body ={
        ambient: 1, // trocar para 2 quando for executar de vdd
        id_cliente : id_cliente,
        obs_pedidio: obs_message,
        valor_ICMS: ""+0.12 * total_sum,
        vendedor_pedido : emissor,
    };

    // cadastrar a nota e depois emitir
    // https://developers.vhsys.com.br/api/#api-Notas_consumidor-PostEmitir
    // https://developers.vhsys.com.br/api/#api-Notas_consumidor-Post
    try {
        // criar a nota fiscal
        const answer = await axios.get(VHSYS + 'v2/notas-consumidor', body, {
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'access-token': ACCESS_TOKEN,
                'secret-access-token': SECRET_ACCESS_TOKEN,
            }
        }).then((resolve) => {
            return resolve.data
        }).catch((e) => {
            console.log(e)
            throw e
        });

        console.log("answer",answer);
        
        // emitir ela após a mesma ter sido criada.
        // https://developers.vhsys.com.br/api/#api-Notas_consumidor-PostEmitir
        const emitted = await axios.get(VHSYS + 'v2/notas-consumidor/'+ answer.data.id_nfc +'/emitir', body, {
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'access-token': ACCESS_TOKEN,
                'secret-access-token': SECRET_ACCESS_TOKEN,
            }
        }).then((resolve) => {
            return resolve.data
        }).catch((e) => {
            console.log(e)
            throw e
        });

        // tem que ver o que tem de emissão, 
        // se gera algum arquivo para enviarmos no bot e nos emails.
        // https://github.com/nodemailer/nodemailer#attachments
        // https://stackoverflow.com/questions/21934667/how-to-attach-file-to-an-email-with-nodemailer
        // enviar email para cliente.

        //criando base do email
        let succm =createSuccessEmail({
            // to: cliente.email_cliente,
            to: "afa7789@gmail.com",
            emitted: JSON.stringify(emitted,2)
        })

        // enviar doc no email.
        // adicionando attachments.
        const unixTime = Math.floor(Date.now() / 1000);
        const fileName = `nota_fiscal_Vlub_${unixTime}.pdf`
        succm.attachments=[
            {
                filename:fileName,
                path: emitted.data.Danfe // consigo por url
            },
        ]

        // enviando email
        await ms.sendMail(succm)

        return response.json({
            status: true,
            filename: filename,
            url: emitted.data.Danfe,
        });

    } catch (e) {
        console.log("e", e)
        let email =createErrorEmail({
            // to: cliente.email_cliente
            to:"afa7789@gmail.com",
        })
        await ms.sendMail(email)

        email =createReportErrorEmail({
            toTeam: email_equipe,
            error: e
        })
        await ms.sendMail(email)


        return response.status(400).json({
            status: false,
        });
    }

})

bot_routes.post('/auth', (request, response) => {
    if (request.body.pass == "Vlub.Vhsys123") {
        return response.status(200).json({
            status: true,
        });

    } else {
        return response.status(400).json({
            status: false,
        });

    }
})

export default bot_routes
