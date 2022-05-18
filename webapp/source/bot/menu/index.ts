import {MenuTemplate} from 'grammy-inline-menu';

import {MyContext} from '../my-context.js';

import {menu as settingsMenu} from './settings/index.js';

export const menu = new MenuTemplate<MyContext>(ctx => ctx.t('welcome', {name: ctx.from!.first_name}));

// so que esse counter aqui não pode ser compartilhado, tinha que ser um para cada usuario.
let counter =0;

// menu.url('Telegram API Documentation', 'https://core.telegram.org/bots/api');
// menu.url('grammY Documentation', 'https://grammy.dev/');
// menu.url('Inline Menu Documentation', 'https://github.com/EdJoPaTo/grammy-inline-menu');

menu.manualRow(
    () => [[{text: 'Page <<', relativePath: 'custom-pagination:-'}, {text: 'Page >>', relativePath: 'custom-pagination:+'}]]
)
menu.manualAction(/custom-pagination:(\+|\-)$/, (context, path) => {
   context.match![1] == '+' ? counter++ : counter--
   console.log('DEBUG',counter, path, context.match![1])
   return '.'
})

menu.submenu(ctx => '⚙️' + ctx.t('menu-settings'), 'settings', settingsMenu);
