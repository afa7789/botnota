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

console.log("ue");

// bot.launch()