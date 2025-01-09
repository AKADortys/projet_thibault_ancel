import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomersService } from '../customers/customers.service';
import { DatabaseModule } from '../database/mongo.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'production',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    DatabaseModule,
  ],
  providers: [AuthService, CustomersService, ConfigService],
  controllers: [AuthController],
})
export class AuthModule {}
