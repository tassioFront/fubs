export class OutboxEntity {
  id: string;
  type: string;
  payload: string;
  processed: boolean;
  createdAt: Date;
  processedAt?: Date;

  get isProcessed(): boolean {
    return this.processed;
  }

  get isPending(): boolean {
    return !this.processed;
  }
}
