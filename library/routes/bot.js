import { MailSender } from "../email/mail.js";
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

    // contruir o body
    body = request.body
    body.ambient = 1
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
        })

        // emitir ela após a mesma ter sido criada.
        // return the qrcode , image and transaction id I think.
        // enviar email para cliente.
        return response.json({
            status: true,
            // items: answer,
        });
    } catch (e) {
        console.log("e", e)
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
