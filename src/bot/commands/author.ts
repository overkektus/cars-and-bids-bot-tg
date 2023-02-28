import { injectable } from "inversify";
import { Bot } from "grammy";

import { Command } from "./command";
import { BotContext } from "../bot.context";

@injectable()
export class AuthorCommand extends Command {
  constructor() {
    super();
  }

  public init(bot: Bot<BotContext>): void {
    bot.command('author', this.commandEnter);
    bot.hears('👨🏻‍💻 Author', this.commandEnter);
  }

  commandEnter(ctx: BotContext): void | Promise<void> {
    throw new Error("Method not implemented.");
  }  
}