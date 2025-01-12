import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseProvider } from '../database/mongo.provider';
import { Db, ObjectId } from 'mongodb';
import {
  CreateProductSchema,
  UpdateProductSchema,
} from '../schema/product.schema';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly collectionName = 'products';
  private db: Db;
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async onModuleInit() {
    this.db = await this.databaseProvider.connect();
  }
  async findAll(): Promise<any[]> {
    try {
      const products = await this.db
        .collection(this.collectionName)
        .find()
        .toArray();
      return products;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const product = await this.db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(id) });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      return product;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(product: any): Promise<any> {
    const { error } = CreateProductSchema.validate(product);
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    const { label } = product;
    try {
      const existingProduct = await this.db
        .collection(this.collectionName)
        .findOne({ label: label });
      if (existingProduct) {
        throw new HttpException(
          'Product with the same label already exists',
          HttpStatus.CONFLICT,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Failed to check for existing product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const result = await this.db
        .collection(this.collectionName)
        .insertOne(product);
      return {
        success: true,
        message: 'produit créé avec succès',
        customerId: result.insertedId,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStock(productId: string, quantity: number): Promise<any> {
    try {
      if (!ObjectId.isValid(productId)) {
        throw new HttpException('Invalid product ID', HttpStatus.BAD_REQUEST);
      }
      const product = await this.findById(productId);

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const newStock = product.stock - quantity;

      if (newStock < 0) {
        throw new HttpException(
          `Insufficient stock for product: ${productId}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.db
        .collection(this.collectionName)
        .updateOne(
          { _id: new ObjectId(productId) },
          { $set: { stock: newStock } },
        );

      return result;
    } catch (error) {
      throw new HttpException(
        'Error updating product stock',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updatedProduct: any): Promise<any> {
    const { error } = UpdateProductSchema.validate(updatedProduct);
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    if (!ObjectId.isValid(id)) {
      throw new HttpException('ID invalide', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.db
        .collection(this.collectionName)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updatedProduct },
          { returnDocument: 'after' }, // Ou `returnOriginal: false` si nécessaire
        );
      return result;
    } catch (error) {
      console.error('Erreur lors de la mise à jour :', error);
      throw new HttpException(
        'Erreur interne',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<any> {
    if (!ObjectId.isValid(id)) {
      throw new HttpException('ID invalide', HttpStatus.BAD_REQUEST);
    }
    try {
      const result = await this.db
        .collection(this.collectionName)
        .deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return new HttpException('produit introuvable', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la suppression',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
