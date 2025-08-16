import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { OutboxRepository } from './outbox.repository';

@Module({
  providers: [OutboxService, OutboxRepository],
  exports: [OutboxService, OutboxRepository],
})
export class OutboxModule {}
