export type IDatabaseService<C, O> = {
  connect(uri: string, options?: O): Promise<C>;
  disconnect(): Promise<void>;
};
