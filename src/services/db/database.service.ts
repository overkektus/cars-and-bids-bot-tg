import { injectable } from 'inversify';
import { Connection, ConnectOptions, createConnection } from "mongoose";

import { IDatabaseService } from './database.interface';

@injectable()
export class DatabaseService implements IDatabaseService<ConnectOptions, ConnectOptions> {
  private connection!: Connection;

  async connect(uri: string, options?: ConnectOptions): Promise<Connection> {
    if (this.connection) {
      return this.connection;
    }

    this.connection = await createConnection(uri, options) as Connection;

    console.log('Connected to MongoDB');

    return this.connection;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log('Disconnected from MongoDB');
    }
  }
}