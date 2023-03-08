import { inject, injectable } from 'inversify';
import mongoose, { ConnectOptions, Mongoose } from 'mongoose';
import { TYPES } from '../../types';
import { ILogger } from '../logger/loger.interface';

import { IDatabaseService } from './database.interface';

@injectable()
export class DatabaseService
  implements IDatabaseService<Mongoose, ConnectOptions>
{
  private connection!: Mongoose;

  constructor(@inject(TYPES.LoggerService) public logger: ILogger) {}

  public async connect(
    uri: string,
    options?: ConnectOptions
  ): Promise<Mongoose> {
    try {
      if (this.connection) {
        return this.connection;
      }

      await mongoose.set('strictQuery', true);
      this.connection = await mongoose.connect(uri, options);

      this.logger.log('Connected to MongoDB');

      return this.connection;
    } catch (error) {
      this.logger.error(String(error));
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.disconnect();
        this.logger.log('Disconnected from MongoDB');
      }
    } catch (error) {
      this.logger.error(String(error));
      throw error;
    }
  }
}
