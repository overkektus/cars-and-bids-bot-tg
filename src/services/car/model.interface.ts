export interface IModelService<T, F, O> {
  create(data: Omit<T, 'id'>): Promise<T>;
  findById(id: string): Promise<T | null>,
  find(filter: F, options?: O): Promise<T[]>,
  count(filter: F): Promise<number>;
  delete(id: string): Promise<boolean>;
}