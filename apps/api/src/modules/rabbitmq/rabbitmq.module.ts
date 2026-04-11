import { Module } from '@nestjs/common';
import { OverviewController } from './controllers/overview.controller';
import { ExchangesController } from './controllers/exchanges.controller';
import { QueuesController } from './controllers/queues.controller';
import { BindingsController } from './controllers/bindings.controller';
import { ConnectionsController } from './controllers/connections.controller';
import { ChannelsController } from './controllers/channels.controller';
import { VhostsController } from './controllers/vhosts.controller';
import { UsersController } from './controllers/users.controller';
import { PoliciesController } from './controllers/policies.controller';
import { DefinitionsController } from './controllers/definitions.controller';
import { RabbitmqApiService } from './services/rabbitmq-api.service';
import { RabbitmqMetricsService } from './services/rabbitmq-metrics.service';

@Module({
  controllers: [
    OverviewController,
    ExchangesController,
    QueuesController,
    BindingsController,
    ConnectionsController,
    ChannelsController,
    VhostsController,
    UsersController,
    PoliciesController,
    DefinitionsController,
  ],
  providers: [RabbitmqApiService, RabbitmqMetricsService],
  exports: [RabbitmqApiService],
})
export class RabbitmqModule {}
