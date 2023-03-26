import { inject, injectable } from 'inversify';
import { Model, FilterQuery, QueryOptions } from 'mongoose';

import { IModelService } from '../../interfaces/model.interface';
import { ICar } from '../../models/car.interface';
import { TYPES } from '../../types';
import { ILogger } from '../logger/loger.interface';

@injectable()
export class CarService
  implements IModelService<ICar, FilterQuery<ICar>, QueryOptions<ICar>>
{
  constructor(
    @inject(TYPES.CarModel) private readonly carModel: Model<ICar>,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) {}

  public async create(data: Omit<ICar, 'id'>): Promise<ICar> {
    const createdCar = new this.carModel(data);
    return createdCar.save();
  }

  public async findById(id: string): Promise<ICar | null> {
    this.logger.log('find car ', id);
    return this.carModel.findById(id).lean();
  }

  public async find(
    filter: FilterQuery<ICar>,
    options?: QueryOptions<ICar>
  ): Promise<ICar[]> {
    return this.carModel.find(filter, null, options).lean();
  }

  public async findAll(): Promise<ICar[]> {
    return this.carModel.find().lean();
  }

  public async update(
    filter: FilterQuery<ICar>,
    data: Partial<ICar>,
    options?: QueryOptions<ICar>
  ): Promise<ICar | null> {
    const updatedCar = await this.carModel.findOneAndUpdate(
      filter,
      data,
      options
    );
    return updatedCar;
  }

  public async delete(id: string): Promise<boolean> {
    const { acknowledged } = await this.carModel.deleteOne({ id });
    return acknowledged;
  }

  public async count(filter: FilterQuery<ICar>): Promise<number> {
    return this.carModel.countDocuments(filter);
  }
}
