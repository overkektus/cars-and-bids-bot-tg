export interface IDatabaseService<C, O> {
  connect(uri: string, options?: O): Promise<C>;
  disconnect(): Promise<void>;
}
