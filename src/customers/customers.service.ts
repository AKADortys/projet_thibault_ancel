import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseProvider } from '../database/mongo.provider';
import * as argon2 from 'argon2';
import {
  createCustomerSchema,
  updateCustomerSchema,
} from '../schema/customer.schema';
import { ObjectId, Db } from 'mongodb';

@Injectable()
export class CustomersService implements OnModuleInit {
  private readonly collectionName = 'customers';
  private db: Db;

  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async onModuleInit() {
    // Connecte à la base de données au moment de l'initialisation du module
    this.db = await this.databaseProvider.connect();
  }

  async findAll(): Promise<any[]> {
    try {
      return await this.db.collection(this.collectionName).find().toArray();
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des clients',
        HttpStatus.INTERNAL_SERVER_ERROR,
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
      const customer = await this.db
        .collection(this.collectionName)
        .findOne({ email });
      if (customer) {
        return new HttpException('Email déjà utilisé', HttpStatus.CONFLICT);
      }
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
      );
    }
  }
}
