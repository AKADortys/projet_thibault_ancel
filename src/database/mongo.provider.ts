import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';
import { data } from './mongo.seed-data';

@Injectable()
export class DatabaseProvider {
  private readonly logger: Logger = new Logger(DatabaseProvider.name);
  private readonly databaseUri: string;
  private readonly databaseName: string;
  private client: MongoClient | null = null; // Instance partagée
  private db: Db | null = null;

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
        await this.seeding();
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
  // Fonction de seeding des données de départ.
  private async seeding(): Promise<void> {
    if (!this.db) {
      this.logger.error('Database instance is not available.');
      return;
    }

    const collections = ['customers', 'products', 'orders'];

    for (const collectionName of collections) {
      try {
        const collection = this.db.collection(collectionName);

        // Vérifie si la collection est vide
        const existingDataCount = await collection.countDocuments();
        if (existingDataCount === 0) {
          this.logger.log(`Seeding ${collectionName} collection...`);

          // Insère les données de seeding
          const seedData = this.getSeedData(collectionName);
          await collection.insertMany(seedData);

          this.logger.log(`Seeding ${collectionName} collection done.`);
        } else {
          this.logger.log(`${collectionName} collection already seeded.`);
        }
      } catch (error) {
        this.logger.error(`Error seeding ${collectionName} collection:`, error);
      }
    }
  }

  //Retourne les données de seeding pour une collection donnée.
  private getSeedData(collectionName: string): any[] {
    switch (collectionName) {
      case 'customers':
        return data.customers;
      case 'products':
        return data.products;
      case 'orders':
        return data.orders;
      default:
        this.logger.warn(
          `No seeding data found for collection: ${collectionName}`,
        );
        return [];
    }
  }
}
