import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseProvider } from '../database/mongo.provider';

@Module({
  imports: [],
  providers: [AuthService, CustomersService, DatabaseProvider],
})
export class AuthModule {}
