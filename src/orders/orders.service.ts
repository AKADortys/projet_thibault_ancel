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
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService implements OnModuleInit {
  private collectionName = 'orders';
  private db: Db;
  constructor(
    private readonly databaseProvider: DatabaseProvider,
    private readonly productsService: ProductsService,
  ) {}
  async onModuleInit(): Promise<void> {
    this.db = await this.databaseProvider.connect();
  }
  async validateStock(order: any): Promise<boolean> {
    try {
      for (const item of order.items) {
        const product = await this.productsService.findById(item.productId);

        if (!product || product.stock < item.quantity) {
          throw new HttpException(
            `Insufficient stock for product: ${item.productId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      return true;
    } catch (error) {
      throw new HttpException(
        'Stock validation error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateStock(order: any): Promise<boolean> {
    try {
      for (const item of order.items) {
        await this.productsService.updateStock(item.productId, item.quantity);
      }
      return true;
    } catch (error) {
      throw new HttpException(
        'Stock update error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      await this.validateStock(order);
      await this.updateStock(order);

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
      if (order.items) {
        const items = order.items;
        await this.itemOrderSchema(items);
        await this.validateStock(order);
        await this.updateStock(order);
      }
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
