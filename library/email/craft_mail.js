import { SMTP_USER } from '../../utils/constants.js';

// =====================
/*
    receive an object with the following properties:
    body = {
      cpf: cpf,
      fullName: fullName,
      email: email,
      cellphone: cellphone,
      walletAddress: walletAddress,
      pix: pixValue,
      token: token,
      message: some message,
      transaction_id: uuid_generate,
      hash: hash, // only on send crypto
      context: // error
    }
*/

function createSuccessEmail(payload) {
    payload.message + `\nhash da transação ${payload.hash}`
    return {
        from: payload.from || SMTP_USER,  // sender address
        to: payload.email,                     // list of receivers
        subject: "TOKENS COMPRADOS",           // Subject line
        text: payload.message.replace(/Comprando/g, 'Comprado '),// plain text body
        html: null,                 // html body
    }
}

function createWarningEmail(payload) {
    return {
        from: payload.from || SMTP_USER,  // sender address
        to: payload.email,                     // list of receivers
        subject: "ORDEM DE COMPRA RECEBIDA",           // Subject line
        text: payload.message,                 // plain text body
        html: null,                 // html body
    }
}

function createExpiredEmail(payload) {
    payload.message = "Olá!!\n" + 
    "O seu pedido de compra de tokens foi expirado, poís o sistema não reconheceu o pagamento de seu pix.\n" +
    `Caso haja algum erro esse é o id de transação: ${payload.transaction_id}.\n\n` +
    `Caso você queria entre em contato com nossa equipe em: ${payload.toTeam}`

    return {
        from: payload.from || SMTP_USER,         // sender address
        to: payload.email,                          // list of receivers
        subject: "O pagamento em pix foi expirado", // Subject line
        text: payload.message,                      // plain text body
        html: null,                      // html body
    }
}

function createErrorEmail(payload) {
    payload.message = "Oi, atenção !!\n" + 
    "A transação na REDE BSC não foi processada corretamente.\n" +
    `Para averiguar a transação esse é o hash: ${payload.hash}\n` +
    "A sua transação pode ter sido colocada na fila para ser tentada novamente.\n\n" +
    "Não se preocupe nossa equipe já está averiguando o que aconteceu.\n" +
    `Caso você não tenha sido alcançado por nossa equipe,\n entre em contato com: ${payload.toTeam}`

    return {
        from: payload.from || SMTP_USER,         // sender address
        to: payload.email,                          // list of receivers
        subject: "Erro na rede BSC", // Subject line
        text: payload.message,                      // plain text body
        html: null,                      // html body
    }
}


function createReportErrorEmail(payload) {
    payload.message = `ATENÇÃO PROBLEMA!!!\n` + 
    `Erro no processamento em background, durante a parte que chamamos de : ${payload.context}\n` +
    `hash da transação: ${payload.hash}\n` +
    `id transação do openpix: ${payload.transaction_id}\n` +
    `token que tentaram adquirir: ${payload.transaction_id}\n` +
    `valor do pix: R$ ${payload.pix}\n` +
    `wallet destino: ${payload.walletAddress}\n` +
    `\nDADOS DO COMPRADOR\n` +
    `email: ${payload.walletAddress}\n` +
    `cpf: ${payload.cpf}\n` +
    `celular: ${payload.cpf}\n` +
    `nome: ${payload.fullName}`;

    return {
        from: payload.from || SMTP_USER,         // sender address
        to: payload.toTeam,                       // list of receivers
        subject: "Error no pagamento: " + payload.context, // Subject line
        text: payload.message,                      // plain text body
        html: null,                      // html body
    }
}

export { createWarningEmail, createSuccessEmail, createErrorEmail, createExpiredEmail, createReportErrorEmail }


/*
    to return
    {
        from: payload.from || SMTP_USER,  // sender address
        to: payload.to,                     // list of receivers
        subject: payload.subject,           // Subject line
        text: payload.text,                 // plain text body
        html: payload.html,                 // html body
    }
*/