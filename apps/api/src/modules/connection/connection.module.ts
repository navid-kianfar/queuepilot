import { Global, Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { ConnectionGateway } from './connection.gateway';
import { EncryptionService } from '../../common/crypto/encryption.service';

@Global()
@Module({
  controllers: [ConnectionController],
  providers: [ConnectionService, ConnectionGateway, EncryptionService],
  exports: [ConnectionService, ConnectionGateway, EncryptionService],
})
export class ConnectionModule {}
