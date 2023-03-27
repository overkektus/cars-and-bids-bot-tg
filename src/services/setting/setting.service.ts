import { inject, injectable } from 'inversify';
import { Model, FilterQuery, QueryOptions } from 'mongoose';

import { IModelService } from '../../interfaces/model.interface';
import { ISetting } from '../../models/setting.interface';
import { TYPES } from '../../types';

@injectable()
export class SettingService
  implements
    IModelService<ISetting, FilterQuery<ISetting>, QueryOptions<ISetting>>
{
  constructor(
    @inject(TYPES.SettingModel) private readonly settingModel: Model<ISetting>
  ) {}

  public async create(data: Omit<ISetting, '_id'>): Promise<ISetting> {
    const createdCar = new this.settingModel(data);
    return createdCar.save();
  }

  public async findById(id: string): Promise<ISetting | null> {
    return this.settingModel.findById(id).lean();
  }

  public async find(
    filter: FilterQuery<ISetting>,
    options?: QueryOptions<ISetting>
  ): Promise<ISetting[]> {
    return this.settingModel.find(filter, null, options).lean();
  }

  public async findAll(): Promise<ISetting[]> {
    return this.settingModel.find().lean();
  }

  public async update(
    filter: FilterQuery<ISetting>,
    data: Partial<ISetting>,
    options?: QueryOptions<ISetting> | undefined
  ): Promise<ISetting | null> {
    const updatedCar = await this.settingModel.findOneAndUpdate(
      filter,
      data,
      options
    );
    return updatedCar;
  }

  public async delete(id: string): Promise<boolean> {
    const { acknowledged } = await this.settingModel.deleteOne({ id });
    return acknowledged;
  }

  public async count(filter: FilterQuery<ISetting>): Promise<number> {
    return this.settingModel.countDocuments(filter);
  }
}
