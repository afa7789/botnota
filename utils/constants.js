import 'dotenv/config'

/////////////////////////////////
// SMTP , to send
export const SMTP_HOST = process.env.SMTP_HOST

export const SMTP_PORT = process.env.SMTP_PORT

export const SMTP_USER = process.env.SMTP_USER

export const SMTP_PASS = process.env.SMTP_PASS

//////////////////////////////////
// VHSYS
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN

export const SECRET_ACCESS_TOKEN= process.env.SECRET_ACCESS_TOKEN

export const VHSYS = "https://api.vhsys.com/"