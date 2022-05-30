import { MailSender } from "./library/email/mail.js";
import { createSuccessEmail } from './library/email/craft_mail.js'

const ms = new MailSender(false);
//criando base do email
let succm = createSuccessEmail({
    email: "afa7789@gmail.com",
    emitted: JSON.stringify({
        "arthur":"teste",
        jacobinos:{
            gerundinos:2,
            algo:4,
        }
    }, 2)
});

// enviar doc no email.
// adicionando attachments.
const unixTime = Math.floor(Date.now() / 1000);
const fileName = `nota_fiscal_Vlub_${unixTime}.pdf`;
succm.attachments = [
    {
        filename: fileName,
        path: "http://www.africau.edu/images/default/sample.pdf" //emitted.data.Danfe // consigo por url
    },
];

// enviando email
await ms.sendMail(succm);