import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseProvider } from '../database/mongo.provider';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, CustomersService, DatabaseProvider, ConfigService],
  controllers: [AuthController],
})
export class AuthModule {}
