import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseProvider } from '../database/mongo.provider';
import { AuthController } from './auth.controller';

@Module({
  imports: [],
  providers: [AuthService, CustomersService, DatabaseProvider],
  controllers: [AuthController],
})
export class AuthModule {}
