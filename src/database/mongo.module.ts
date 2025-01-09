import { Module } from '@nestjs/common';
import { DatabaseProvider } from './mongo.provider';

@Module({
  providers: [DatabaseProvider],
  exports: [DatabaseProvider],
})
export class DatabaseModule {}
