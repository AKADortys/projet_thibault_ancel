import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from 'src/database/mongo.module';
import { AuthMiddleware } from 'src/token/token.middleware';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from 'src/customers/customers.module';

@Module({
  imports: [DatabaseModule, ProductsModule, CustomersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'orders/all', method: RequestMethod.GET },
        { path: 'orders/order/:id', method: RequestMethod.GET },
        { path: 'orders/user/:id', method: RequestMethod.GET },
        { path: 'orders/update/:id', method: RequestMethod.PUT },
        { path: 'orders/delete/:id', method: RequestMethod.DELETE },
      );
  }
}
