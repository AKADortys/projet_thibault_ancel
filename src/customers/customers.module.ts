import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { DatabaseProvider } from '../database/mongo.provider';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, DatabaseProvider],
})
export class CustomersModule {}
