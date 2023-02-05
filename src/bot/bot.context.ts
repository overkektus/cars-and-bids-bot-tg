import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Context, SessionFlavor } from "grammy";

export interface SessionData {
  carListMenu: {
    currentPage: number;
  }
}

export type BotContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
export type BotConversation = Conversation<BotContext>;