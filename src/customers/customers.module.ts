import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { AuthMiddleware } from '../token/token.middleware';
import { DatabaseModule } from 'src/database/mongo.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('customers'); // Applique le middleware pour toutes les routes de 'customers'
  }
}
