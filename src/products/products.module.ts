import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DatabaseModule } from 'src/database/mongo.module';
import { AuthMiddleware } from 'src/token/token.middleware';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'products/create', method: RequestMethod.ALL },
        { path: 'products/delete/:id', method: RequestMethod.DELETE },
        { path: 'products/update/:id', method: RequestMethod.PUT },
      );
  }
}
