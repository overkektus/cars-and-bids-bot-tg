export type IModelService<T, F, O> = {
  create(data: Omit<T, '_id'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  find(filter: F, options?: O): Promise<T[]>;
  findAll(): Promise<T[]>;
  update(filter: F, data: Partial<T>, options?: O): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter: F): Promise<number>;
};
