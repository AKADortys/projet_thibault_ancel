import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseProvider } from '../database/mongo.provider';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, CustomersService, DatabaseProvider],
  controllers: [AuthController],
})
export class AuthModule {}
