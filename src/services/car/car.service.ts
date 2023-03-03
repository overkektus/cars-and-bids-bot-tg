import { inject, injectable } from 'inversify';
import { Model, FilterQuery, QueryOptions } from 'mongoose';

import { IModelService } from './model.interface';
import { ICar } from '../../models/car.interface';
import { TYPES } from '../../types';

@injectable()
export class CarService implements IModelService<ICar, FilterQuery<ICar>, QueryOptions<ICar>> {
  constructor(@inject(TYPES.CarModel) private readonly carModel: Model<ICar>) { }

  public async create(data: Omit<ICar, 'id'>): Promise<ICar> {
    const createdCar = new this.carModel(data);
    return createdCar.save();
  }

  public async findById(id: string): Promise<ICar | null> {
    return this.carModel.findById(id).lean();
  }

  public async find(filter: FilterQuery<ICar>, options?: QueryOptions<ICar>): Promise<ICar[]> {
    return this.carModel.find(filter, null, options).lean();
  }
  
  public async delete(id: string): Promise<boolean> {
    const { acknowledged } = await this.carModel.deleteOne({ id });
    return acknowledged;
  }

  public async count(filter: FilterQuery<ICar>): Promise<number> {
    return this.carModel.countDocuments(filter);
  }
}