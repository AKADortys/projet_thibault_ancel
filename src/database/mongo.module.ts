import { Module, OnApplicationShutdown } from '@nestjs/common';
import { DatabaseProvider } from './mongo.provider';

@Module({
  providers: [DatabaseProvider],
  exports: [DatabaseProvider],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async onApplicationShutdown() {
    await this.databaseProvider.disconnect();
  }
}
