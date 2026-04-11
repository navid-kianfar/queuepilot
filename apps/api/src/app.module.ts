import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/database.module';
import { ConnectionModule } from './modules/connection/connection.module';
import { SSEModule } from './modules/sse/sse.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SearchModule } from './modules/search/search.module';
import { AuditModule } from './modules/audit/audit.module';
import { RabbitmqModule } from './modules/rabbitmq/rabbitmq.module';
import { BullmqModule } from './modules/bullmq/bullmq.module';
import { KafkaModule } from './modules/kafka/kafka.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'web', 'dist'),
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
    DatabaseModule,
    ConnectionModule,
    SSEModule,
    FavoritesModule,
    SettingsModule,
    SearchModule,
    AuditModule,
    RabbitmqModule,
    BullmqModule,
    KafkaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
