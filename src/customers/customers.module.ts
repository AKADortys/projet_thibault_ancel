import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
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
    consumer.apply(AuthMiddleware).forRoutes(
      { path: 'customers/customer/:id', method: RequestMethod.GET }, // Pas de paramètre ici
      { path: 'customers/all', method: RequestMethod.GET }, // Pas de paramètre ici
      { path: 'customers/email/:email', method: RequestMethod.GET }, // Nécessite un email
      { path: 'customers/update/:id', method: RequestMethod.PUT }, // Nécessite un ID
      { path: 'customers/delete/:id', method: RequestMethod.DELETE }, // Nécessite un ID
    );
  }
}
