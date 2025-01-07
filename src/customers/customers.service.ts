import { Injectable, Inject } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';

@Injectable()
export class CustomersService {
  private readonly collectionName = 'customers';

  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async findAll(): Promise<any[]> {
    return this.db.collection(this.collectionName).find().toArray();
  }

  async create(data: any): Promise<any> {
    const result = await this.db
      .collection(this.collectionName)
      .insertOne(data);
    return result;
  }

  async findById(id: string): Promise<any> {
    return this.db
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id) });
  }

  async update(id: string, data: any): Promise<any> {
    const result = await this.db
      .collection(this.collectionName)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' },
      );
    return result.value;
  }

  async delete(id: string): Promise<any> {
    return this.db
      .collection(this.collectionName)
      .deleteOne({ _id: new ObjectId(id) });
  }
}
