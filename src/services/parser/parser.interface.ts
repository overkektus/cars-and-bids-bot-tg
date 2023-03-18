export interface IParser<T> {
  setInitialLastEventId(url: string): Promise<void>;
  checkAuctionUpdates(id: string): Promise<T | null>;
  checkIsActionEnd(url: string): Promise<boolean>;
  getCarTitle(url: string): Promise<string>;
}
