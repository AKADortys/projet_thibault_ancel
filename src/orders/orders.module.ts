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

@Module({
  imports: [DatabaseModule, ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'orders', method: RequestMethod.GET });
  }
}
