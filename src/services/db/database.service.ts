import { injectable } from 'inversify';
import { Connection, ConnectOptions, createConnection } from "mongoose";

import { IDatabaseService } from './database.interface';

@injectable()
export class DatabaseService implements IDatabaseService<ConnectOptions, ConnectOptions> {
  private connection!: Connection;

  async connect(uri: string, options?: ConnectOptions): Promise<Connection> {
    try {
      if (this.connection) {
        return this.connection;
      }

      this.connection = await createConnection(uri, options) as Connection;

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
        await this.connection.close();
        console.log('Disconnected from MongoDB');
      }
    } catch(error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}