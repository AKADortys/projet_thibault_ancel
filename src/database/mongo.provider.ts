import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DatabaseProvider {
  private readonly databaseUri: string;

  constructor(private configService: ConfigService) {
    this.databaseUri = this.configService.get<string>('MONGO_DB_URI');
  }

  async connect(): Promise<Db> {
    try {
      const client = new MongoClient(this.databaseUri, { authSource: 'admin' });
      await client.connect();
      return client.db(this.configService.get<string>('MONGO_DB_NAME')); // Retourne une instance de la base de données
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
    }
  }
}
