export interface SubscriptionEventPayload {
  id: string;
  ownerId: string;
  planType: string;
  status: string;
  expiresAt: Date;
  workspaceLimit: number | null; // null means unlimited workspaces creation
}
