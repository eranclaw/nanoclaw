import { describe, it, expect } from 'vitest';
import { signPayload, verifySignature } from '../delivery';

describe('webhook signatures', () => {
  const secret = 'test-secret-key';
  const payload = JSON.stringify({ event: 'pr.opened', data: {} });

  it('generates valid HMAC-SHA256 signatures', () => {
    const signature = signPayload(payload, secret);
    expect(signature).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it('verifies valid signatures', () => {
    const signature = signPayload(payload, secret);
    expect(verifySignature(payload, signature, secret)).toBe(true);
  });

  it('rejects invalid signatures', () => {
    expect(verifySignature(payload, 'sha256=invalid', secret)).toBe(false);
  });

  it('rejects tampered payloads', () => {
    const signature = signPayload(payload, secret);
    const tampered = payload + 'x';
    expect(verifySignature(tampered, signature, secret)).toBe(false);
  });
});
