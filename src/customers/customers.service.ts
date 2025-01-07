import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import * as argon2 from 'argon2';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../schema/customer.schema';

@Injectable()
export class CustomersService {
  private readonly collectionName = 'customers';

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async findAll(): Promise<any[]> {
    try {
      return await this.db.collection(this.collectionName).find().toArray();
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des clients',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async create(data: any): Promise<any> {
    const { error } = createCustomerSchema.validate(data);
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    const { firstName, lastName, email, password, phone } = data;

    if (!firstName || !lastName || !email || !password) {
      throw new HttpException(
        'Les champs obligatoires sont manquants',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const hashedPassword = await argon2.hash(password);

      const customerData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        role: 'client',
      };

      const result = await this.db
        .collection(this.collectionName)
        .insertOne(customerData);

      return {
        success: true,
        message: 'Client créé avec succès',
        customerId: result.insertedId,
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du client',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async findById(id: string): Promise<any> {
    if (!ObjectId.isValid(id)) {
      throw new HttpException('ID invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      const customer = await this.db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(id) });

      if (!customer) {
        throw new HttpException('Client introuvable', HttpStatus.NOT_FOUND);
      }

      return customer;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération du client',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async findByMail(email: string): Promise<any> {
    try {
      const customer = await this.db
        .collection(this.collectionName)
        .findOne({ email });

      if (!customer) {
        throw new HttpException(
          'Client introuvable avec cet email',
          HttpStatus.NOT_FOUND,
        );
      }

      return customer;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération du client par email',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }

  async update(id: string, data: any): Promise<any> {
    const { error } = updateCustomerSchema.validate(data);
    if (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
    if (!ObjectId.isValid(id)) {
      throw new HttpException('ID invalide', HttpStatus.BAD_REQUEST);
    }
    if (data.password !== undefined) {
      const hashedPassword = await argon2.hash(data.password);
      data.password = hashedPassword;
    }

    try {
      const result = await this.db
        .collection(this.collectionName)
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: data },
          { returnDocument: 'after' },
        );

      return {
        success: true,
        message: 'Client mis à jour avec succès',
        customer: result.value,
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du client',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
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
        throw new HttpException('Client introuvable', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Client supprimé avec succès',
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la suppression du client',
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
      );
    }
  }
}
