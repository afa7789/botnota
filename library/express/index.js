import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import bot_routes from '../routes/bot.js'

const app = express()

// APP USES
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.text())

const corsOptions = {
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token', 'Authorization','api-signature'],
    origin: '*',
}

app.use(cors(corsOptions))

// APP SETS
app.set('trust proxy', true)

// bot routes
app.use('', bot_routes)

export default app
