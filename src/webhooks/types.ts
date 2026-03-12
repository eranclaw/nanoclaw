export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  active: boolean;
  createdAt: Date;
}

export type WebhookEvent =
  | 'pr.opened'
  | 'pr.closed'
  | 'pr.merged'
  | 'pr.review_requested'
  | 'pr.approved'
  | 'pr.changes_requested'
  | 'ci.passed'
  | 'ci.failed';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  statusCode?: number;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  createdAt: Date;
  deliveredAt?: Date;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}
