import { createHmac } from 'node:crypto';
import type { WebhookConfig, WebhookDelivery, WebhookEvent, WebhookPayload } from './types';

const RETRY_DELAYS = [1000, 5000, 30000, 120000]; // 1s, 5s, 30s, 2m
const MAX_ATTEMPTS = 4;

export function signPayload(payload: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
}

export async function deliverWebhook(
  config: WebhookConfig,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<WebhookDelivery> {
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);
  const signature = signPayload(body, config.secret);

  const delivery: WebhookDelivery = {
    id: crypto.randomUUID(),
    webhookId: config.id,
    event,
    payload: data,
    status: 'pending',
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    createdAt: new Date(),
  };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    delivery.attempts = attempt + 1;

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-Delivery': delivery.id,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });

      delivery.statusCode = response.status;

      if (response.ok) {
        delivery.status = 'delivered';
        delivery.deliveredAt = new Date();
        return delivery;
      }
    } catch {
      // Network error, will retry
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
    }
  }

  delivery.status = 'failed';
  return delivery;
}

export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = signPayload(payload, secret);
  if (signature.length !== expected.length) return false;

  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}
