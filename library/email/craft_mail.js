import { SMTP_FROM } from '../../utils/constants.js';

// =====================
function createSuccessEmail(payload) {

    payload.message = "Oi obrigado por comprar com a VLub,\n"+
    "segue link para baixar sua nota fiscal: não ta pronto o email";

    return {
        from: payload.from || SMTP_FROM,  // sender address
        to: payload.email,                     // list of receivers
        subject: "Nota fiscal Emitida!",           // Subject line
        text: payload.message,// plain text body
        html: null,                 // html body
    }
}

function createErrorEmail(payload) {
    payload.message = "Oi, atenção !!\n" + 
    "A emissão da nota fiscal não deu certo.\n" +
    "Não se preocupe nossa equipe já está averiguando o que aconteceu.\n" +
    `Caso você não tenha sido alcançado por nossa equipe,\n entre em contato com: ${payload.toTeam}`

    return {
        from: payload.from || SMTP_FROM,         // sender address
        to: payload.email,                          // list of receivers
        subject: "Erro na emissão de nota", // Subject line
        text: payload.message,                      // plain text body
        html: null,                      // html body
    }
}


function createReportErrorEmail(payload) {
    payload.message = `ATENÇÃO PROBLEMA!!!\n` + 
    `Erro no processamento em background\n`+
    "bot do telegram\n "+
    JSON.stringify(payload.error,2,2);

    return {
        from: payload.from || SMTP_FROM,         // sender address
        to: payload.toTeam,                       // list of receivers
        subject: "Error na emissão de nota", // Subject line
        text: payload.message,                      // plain text body
        html: null,                      // html body
    }
}

export { createSuccessEmail, createErrorEmail, createReportErrorEmail }

