export type EventType =
  | 'bid'
  | 'comment'
  | 'system-comment'
  | 'flagged-comment';

type BaseEvent = {
  id: string;
  type: EventType;
}

type BidEvent = {
  type: 'bid';
  value: number;
} & BaseEvent

type CommentEvent = {
  type: 'comment' | 'system-comment' | 'flagged-comment';
  comment: string;
} & BaseEvent

export type ThreadEvent = CommentEvent | BidEvent | null;

export type INotificationMessage = {
  carId: string;
  actions: Array<ThreadEvent>;
}

export type ICar = {
  _id: string;
  userId: number;
  url: string;
  carTitle: string;
  lastEventId?: string;
}
