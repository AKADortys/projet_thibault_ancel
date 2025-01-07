import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseProvider } from './database/mongo.provider';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CustomersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, DatabaseProvider],
  exports: [DatabaseProvider],
})
export class AppModule {}
