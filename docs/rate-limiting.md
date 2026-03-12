# Rate Limiting

Nanoclaw uses a sliding window token bucket algorithm for rate limiting.

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `maxTokens` | 100 | Maximum burst size |
| `refillRate` | 10 | Tokens added per second |
| `windowMs` | 60000 | Cleanup window (ms) |

## How It Works

1. Each IP gets a bucket of tokens (default: 100)
2. Each request consumes one token
3. Tokens refill continuously at `refillRate` per second
4. When tokens reach zero, requests are rejected with a `retryAfter` hint
5. Stale entries are cleaned up every 5 minutes

## Response Headers

- `X-RateLimit-Remaining`: Tokens left in current window
- `X-RateLimit-Reset`: Seconds until next token available (when blocked)
