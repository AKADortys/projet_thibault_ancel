import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { DatabaseProvider } from '../database/mongo.provider';
import { Db, ObjectId } from 'mongodb';
import {
  createOrderSchema,
  itemsOrderSchema,
  updateOrderSchema,
} from '../schema/orders.schema';
import { ProductsService } from '../products/products.service';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class OrdersService implements OnModuleInit {
  private collectionName = 'orders';
  private readonly logger: Logger = new Logger(OrdersService.name);
  private db: Db;

  constructor(
    private readonly databaseProvider: DatabaseProvider,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.db = await this.databaseProvider.connect();
    } catch (error) {
      this.logger.error(`Database connection error: ${error.message}`);
      throw new HttpException(
        'Failed to connect to the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private handleError(message: string, status: HttpStatus): never {
    this.logger.error(message);
    throw new HttpException(message, status);
  }

  private validateSchema(schema: any, data: any): void {
    const { error } = schema.validate(data);
    if (error) {
      const message = error.details[0].message;
      this.handleError(message, HttpStatus.BAD_REQUEST);
    }
  }

  async validateStock(order: any): Promise<boolean> {
    for (const item of order.items) {
      const product = await this.productsService.findById(item.productId);
      if (!product || product.stock < item.quantity || item.quantity <= 0) {
        this.handleError(
          `Insufficient stock for product: ${item.productId}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return true;
  }

  async itemOrderSchema(items): Promise<void> {
    for (const element of items) {
      this.validateSchema(itemsOrderSchema, element);
    }
  }

  async findAll(): Promise<any[]> {
    try {
      return await this.db.collection(this.collectionName).find().toArray();
    } catch (error) {
      this.handleError(
        'Failed to fetch orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<any> {
    if (!ObjectId.isValid(id)) {
      this.handleError('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    try {
      const order = await this.db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(id) });
      if (!order) {
        this.handleError('Order not found', HttpStatus.NOT_FOUND);
      }
      return order;
    } catch (error) {
      this.handleError(
        'Failed to fetch order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByUserId(userId: string): Promise<any[]> {
    if (!ObjectId.isValid(userId)) {
      this.handleError('Invalid User ID', HttpStatus.BAD_REQUEST);
    }
    try {
      const customer = await this.customersService.findById(userId);
      if (!customer) {
        this.handleError('Customer not found', HttpStatus.NOT_FOUND);
      }
      return await this.db
        .collection(this.collectionName)
        .find({ userId: new ObjectId(userId) })
        .toArray();
    } catch (error) {
      this.handleError(
        'Failed to fetch orders by user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(order: any): Promise<any> {
    this.validateSchema(createOrderSchema, order);
    await this.itemOrderSchema(order.items);
    await this.validateStock(order);
    try {
      const result = await this.db
        .collection(this.collectionName)
        .insertOne(order);
      this.logger.debug(`Command created order: ${result.insertedId}`);
      return { ...order };
    } catch (error) {
      this.handleError(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, order: any): Promise<any> {
    if (!ObjectId.isValid(id)) {
      this.handleError('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    this.validateSchema(updateOrderSchema, order);
    if (order.items) {
      await this.itemOrderSchema(order.items);
      await this.validateStock(order);
    }
    try {
      const result = await this.db
        .collection(this.collectionName)
        .updateOne({ _id: new ObjectId(id) }, { $set: order });
      if (result.matchedCount === 0) {
        this.handleError('Order not found', HttpStatus.NOT_FOUND);
      }
      this.logger.debug(`order updated: ${id}`);
      return { id, ...order };
    } catch (error) {
      this.handleError(
        'Failed to update order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      this.handleError('Invalid ID', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.db
        .collection(this.collectionName)
        .deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        this.handleError('Order not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      this.handleError(
        'Failed to delete order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
