import { injectable } from 'inversify';
import  mongoose, { ConnectOptions, Mongoose } from "mongoose";

import { IDatabaseService } from './database.interface';

@injectable()
export class DatabaseService implements IDatabaseService<Mongoose, ConnectOptions> {
  private connection!: Mongoose;

  async connect(uri: string, options?: ConnectOptions): Promise<Mongoose> {
    try {
      if (this.connection) {
        return this.connection;
      }

      await mongoose.set('strictQuery', true);
      this.connection = await mongoose.connect(uri, options);

      console.log('Connected to MongoDB');

      return this.connection;
    } catch(error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.disconnect();
        console.log('Disconnected from MongoDB');
      }
    } catch(error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}