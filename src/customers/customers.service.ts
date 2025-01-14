import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Logger,
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
  private logger: Logger = new Logger(this.collectionName);

  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async onModuleInit() {
    // Connecte à la base de données au moment de l'initialisation du module
    this.db = await this.databaseProvider.connect();
  }
  private handleError(message: string, status: HttpStatus): never {
    this.logger.error(message);
    throw new HttpException(message, status);
  }

  async findAll(): Promise<any[]> {
    try {
      return await this.db.collection(this.collectionName).find().toArray();
    } catch (error) {
      this.handleError(
        'Erreur lors de la récupération de tous les clients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: any): Promise<any> {
    const { error } = createCustomerSchema.validate(data);
    if (error) {
      this.handleError(error.message, HttpStatus.BAD_REQUEST);
    }
    const { firstName, lastName, email, password, phone } = data;

    if (!firstName || !lastName || !email || !password) {
      this.handleError(
        'Les champs obligatoires sont manquants',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const customer = await this.db
        .collection(this.collectionName)
        .findOne({ email });
      if (customer) {
        this.handleError(
          'Email déjà existant dans la base de donnée',
          HttpStatus.CONFLICT,
        );
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
      this.handleError(
        'Erreur lors de la création du client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findById(id: string): Promise<any> {
    if (!ObjectId.isValid(id)) {
      this.handleError('Invalid id', HttpStatus.BAD_REQUEST);
    }

    try {
      const customer = await this.db
        .collection(this.collectionName)
        .findOne({ _id: new ObjectId(id) });

      if (!customer) {
        this.handleError('Client introuvable', HttpStatus.NOT_FOUND);
      }

      return customer;
    } catch (error) {
      this.handleError(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByMail(email: string): Promise<any> {
    try {
      const customer = await this.db
        .collection(this.collectionName)
        .findOne({ email });
      if (!customer) {
        this.handleError(
          `Client introuvable avec cet email ${email}`,
          HttpStatus.NOT_FOUND,
        );
      }
      return customer;
    } catch (error) {
      this.handleError(
        'Erreur lors de la récupération du client par email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: any): Promise<any> {
    const { error } = updateCustomerSchema.validate(data);
    if (error) {
      this.handleError(error.message, HttpStatus.BAD_REQUEST);
    }
    if (!ObjectId.isValid(id)) {
      this.handleError('id introuvable', HttpStatus.BAD_REQUEST);
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
      this.handleError(
        'Erreur lors de la mise à jour client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: string): Promise<any> {
    if (!ObjectId.isValid(id)) {
      this.handleError('ID invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.db
        .collection(this.collectionName)
        .deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        this.handleError('Client introuvable', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: 'Client supprimé avec succès',
      };
    } catch (error) {
      this.handleError(
        'Erreur lors de la suppression du client',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
