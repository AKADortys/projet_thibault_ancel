import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseProvider } from '../database/mongo.provider';
import { Db, ObjectId } from 'mongodb';
import {
  createOrderSchema,
  itemOrderSchema,
  updateOrderSchema,
} from '../schema/orders.schema';

@Injectable()
export class OrdersService implements OnModuleInit {
  private collectionName = 'orders';
  private db: Db;
  constructor(private readonly databaseProvider: DatabaseProvider) {}
  async onModuleInit(): Promise<void> {
    this.db = await this.databaseProvider.connect();
  }
  async findAll(): Promise<any[]> {
    try {
      return this.db.collection(this.collectionName).find().toArray();
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findById(id: string): Promise<any[]> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
      }
      return this.db
        .collection(this.collectionName)
        .find({ _id: new ObjectId(id) })
        .toArray();
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async create(order: any): Promise<any> {
    try {
      const { error } = createOrderSchema.validate(order);
      if (error) {
        throw new HttpException(
          error.details[0].message,
          HttpStatus.BAD_REQUEST,
        );
      }

      return this.db.collection(this.collectionName).insertOne(order);
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
