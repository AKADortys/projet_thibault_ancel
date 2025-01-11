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
  itemsOrderSchema,
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

  async itemOrderSchema(items): Promise<any> {
    if (items.length > 0) {
      items.forEach((element) => {
        const { error } = itemsOrderSchema.validate(element);
        console.log(error);
        if (error) {
          throw new HttpException('Invalid item order', HttpStatus.BAD_REQUEST);
        }
      });
      return true;
    }
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
  async findByUserId(id: string): Promise<any> {
    try {
      console.log(id);
      if (!ObjectId.isValid(id)) {
        throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
      }
      return this.db
        .collection(this.collectionName)
        .find({ userId: id })
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
        console.error(error);
        throw new HttpException(
          error.details[0].message,
          HttpStatus.BAD_REQUEST,
        );
      }
      const items = order.items;
      await this.itemOrderSchema(items);

      return this.db.collection(this.collectionName).insertOne(order);
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async update(id: string, order: any): Promise<any> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
      }
      const { error } = updateOrderSchema.validate(order);
      if (error) {
        console.error(error);
        throw new HttpException(
          error.details[0].message,
          HttpStatus.BAD_REQUEST,
        );
      }
      const items = order.items;
      await this.itemOrderSchema(items);
      return this.db
        .collection(this.collectionName)
        .updateOne({ _id: new ObjectId(id) }, { $set: order });
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async delete(id: string): Promise<any> {
    try {
      if (!ObjectId.isValid(id)) {
        throw new HttpException('Invalid ID', HttpStatus.BAD_REQUEST);
      }
      return this.db
        .collection(this.collectionName)
        .deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
