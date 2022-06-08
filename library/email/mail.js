import nodemailer from 'nodemailer';
import { SMTP_USER, SMTP_HOST, SMTP_PORT, SMTP_PASS,SMTP_FROM } from '../../utils/constants.js';

// Constructor function
class MailSender{
    
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // console.log(SMTP_USER, SMTP_HOST, SMTP_PORT, SMTP_PASS);
    constructor(boole) {
        // create reusable transporter object using the default SMTP transport
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: boole, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });
    }

    // send mail with defined transport object
    async sendMail(payload){ 
        try {
            let info = await this.transporter.sendMail({
                from: payload.from || SMTP_FROM,  // sender address
                to: payload.to,                     // list of receivers
                subject: payload.subject,           // Subject line
                text: payload.text,                 // plain text body
                html: payload.html,                 // html body
                attachments: payload.attachments
            });
        }catch(error){
            console.log("error at sendMail",error);
        }

        return info;
    };

    async previewMail(info){
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }

}

export { MailSender };