import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  carListMenu: {
    currentPage: number;
    currentCarId: string | null;
  };
}

export const initialSessionState: SessionData = {
  carListMenu: {
    currentPage: 1,
    currentCarId: null,
  },
};

export type BotContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor;
export type BotConversation = Conversation<BotContext>;
