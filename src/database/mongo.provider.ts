import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DatabaseProvider {
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
      // Initialise une seule connexion si elle n'existe pas encore
      this.client = new MongoClient(this.databaseUri, { authSource: 'admin' });
      await this.client.connect();
      console.log('Connected to MongoDB!');
      this.db = this.client.db(this.databaseName);
    }
    return this.db; // Réutilise l'instance existante
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }
}
