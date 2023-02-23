type EventType = 'bid' | 'comment';

interface BaseEvent {
  id: string;
  type: EventType;
}

interface BidEvent extends BaseEvent {
  value: number;
}

interface CommentEvent extends BaseEvent {
  comment: string;
}

export type ThreadEvent = CommentEvent | BidEvent;

export interface ICar {
  userId: number;
  url: string;
  carTitle: string;
  events: Array<ThreadEvent>
}