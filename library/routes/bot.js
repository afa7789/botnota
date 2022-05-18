import { MailSender } from "../email/mail.js";
import { VHSYS, ACCESS_TOKEN, SECRET_ACCESS_TOKEN } from '../../utils/constants.js'
import express from 'express';
import axios from 'axios';

const ms = new MailSender();

var bot_routes = express.Router()

bot_routes.get(
    '/clients',
    async (request, response) => {
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
                return resolve.data.data.map( el =>{
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
                data: answer,
            });

        } catch (e) {
            console.log("e",e)
            return response.status(400).json({
                status: false,
            });
        }
    }
)

bot_routes.get(
    '/products',
    async (request, response) => {
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
                return resolve.data.data.filter(el =>{
                    return parseFloat(el.valor_produto) > 0
                }).map( el =>{
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
                data: answer,
            });

        } catch (e) {
            console.log("e",e)
            return response.status(400).json({
                status: false,
            });
        }
    }
)

export default bot_routes
