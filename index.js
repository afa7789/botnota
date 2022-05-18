import app from './library/express/index.js';
import 'dotenv/config';


const PORT = process.env.PORT || 3000 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.listen(PORT,()=>{
//   console.log('Example app listening on port http://localhost:' + PORT);
// })

import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local'

const bot = new Telegraf(process.env.BOT_TOKEN,{
  telegram: {           // Telegram options
    agent: null,        // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
    webhookReply: true  // Reply via webhook
  },
  username: 'Angu.Eth',         // Bot username (optional)
  channelMode: false    // Handle `channel_post` updates as messages (optional)
})

bot.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log('Response time: %sms', ms)
})

bot.use((new LocalSession({ database: 'example_db.json' })).middleware())

bot.start((ctx) => ctx.reply('Welcome'))

bot.on('text', (ctx, next) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  ctx.replyWithMarkdown(`Counter updated, new value: \`${ctx.session.counter}\``)
  return next()
})

bot.command('/stats', (ctx) => {
  ctx.replyWithMarkdown(`Database has \`${ctx.session.counter}\` messages from @${ctx.from.username || ctx.from.id}`)
})

bot.command('/remove', (ctx) => {
  ctx.replyWithMarkdown(`Removing session from database: \`${JSON.stringify(ctx.session)}\``)
  // Setting session to null, undefined or empty object/array will trigger removing it from database
  ctx.session = null
})

bot.launch()

