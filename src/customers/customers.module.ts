import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuthMiddleware } from '../token/token.middleware';
import { DatabaseProvider } from '../database/mongo.provider';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, DatabaseProvider],
})
export class CustomersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('customers', 'customers/'); // Applique le middleware pour toutes les routes de 'customers'
  }
}
