import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DatabaseProvider {
  private readonly logger: Logger = new Logger(DatabaseProvider.name);
  private readonly databaseUri: string;
  private readonly databaseName: string;
  private client: MongoClient | null = null; // Instance partagée
  private db: Db | null = null; // Instance de la base de données partagée

  constructor(private configService: ConfigService) {
    this.databaseUri = this.configService.get<string>('MONGO_DB_URI');
    this.databaseName = this.configService.get<string>('MONGO_DB_NAME');
  }

  async connect(): Promise<Db> {
    if (!this.client) {
      try {
        this.logger.warn('Connecting to MongoDB');
        this.client = new MongoClient(this.databaseUri, {
          authSource: 'admin',
        });
        await this.client.connect();
        this.logger.warn('Connected to MongoDB');
        this.db = this.client.db(this.databaseName);
      } catch (error) {
        this.logger.error('Error connecting to MongoDB', error);
      }
    }
    return this.db;
  }
  async getClient(): Promise<MongoClient> {
    return this.client;
  }
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.logger.warn('Disconnected from MongoDB');
    }
  }
}
