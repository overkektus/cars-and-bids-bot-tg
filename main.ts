import { IApp } from './src/app.interface';
import { container } from './src/inversify.config';
import { TYPES } from './src/types';

const app = container.get<IApp>(TYPES.App);
app.launch();

// import { Bot } from 'grammy';

// const bot = new Bot('6231965991:AAFNGYv83tc9DjYEZyNk1sLCvIQ4lxWZYqE');

// // Define a command handler
// bot.command('start', async (ctx) => {
//   await ctx.reply('Hello, world!');
// });

// // Start the bot
// bot.start();