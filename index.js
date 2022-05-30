import app from './library/express/index.js';
import bot from './library/telegraf/index.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('O que você ta fazendo aqui rapaz 👀 ? É muito perigoso!!🙀')
});

app.listen(PORT,()=>{
  console.log('Example app listening on port http://localhost:' + PORT);
});

// bot.launch()

// data: '{"client_id":21160143,"emitter":"undefined undefined","set":[{"name":"ASF41QT","price":"67.040000","quantity":120}]}'