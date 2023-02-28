import { injectable } from 'inversify';
import { Connection, Channel, ConsumeMessage, connect } from 'amqplib';

import { IMQ } from './mq.interface';

export type ConsumerMessageType = ConsumeMessage | null;

@injectable()
export class RabbitMQ implements IMQ<ConsumerMessageType> {
  private connectionAMPQ!: Connection;
  private channelAMPQ!: Channel;
  
  public accept(data: ConsumerMessageType): void {
    if (data) {
      this.channelAMPQ.ack(data);
    }
  }

  public async connect(uri: string): Promise<void> {
    try {
      this.connectionAMPQ = await connect(uri);
      this.channelAMPQ = await this.connectionAMPQ.createChannel();

      console.log('rabbitMQ connected');
    } catch(error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  public async closeConnection(): Promise<void> {
    try {
      await this.channelAMPQ.close();
      await this.connectionAMPQ.close();
    } catch(error) {
      console.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }

  public sendData<T>(queueName: string, data: T): void {
    this.channelAMPQ.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  }
  
  public async setConsume(queueName: string, consumer: (msg: ConsumerMessageType) => void): Promise<void> {
    this.channelAMPQ.consume(queueName, consumer);
  }

  public async assertQueue(queueName: string): Promise<void> {
    await this.channelAMPQ.assertQueue(queueName);
  }
}