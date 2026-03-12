# Webhooks

Nanoclaw supports outbound webhooks to notify external services of events.

## Events

| Event | Description |
|-------|-------------|
| `pr.opened` | New PR opened |
| `pr.closed` | PR closed without merge |
| `pr.merged` | PR merged |
| `pr.review_requested` | Review requested on a PR |
| `pr.approved` | PR approved |
| `pr.changes_requested` | Changes requested on a PR |
| `ci.passed` | CI checks passed |
| `ci.failed` | CI checks failed |

## Payload Format

```json
{
  "event": "pr.opened",
  "timestamp": "2026-03-12T20:00:00.000Z",
  "data": {
    "pr": { ... },
    "repository": { ... }
  }
}
```

## Security

All webhooks are signed with HMAC-SHA256. Verify the `X-Webhook-Signature` header.

## Retry Policy

Failed deliveries are retried up to 4 times with exponential backoff:
1s → 5s → 30s → 2m
