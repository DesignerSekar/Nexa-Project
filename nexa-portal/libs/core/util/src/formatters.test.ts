import { describe, expect, it } from 'vitest';
import {
  CONTENT_TRUNCATE_LENGTH,
  formatCount,
  humanizeStatus,
  senderHandle,
  truncate,
} from './formatters';

/**
 * These assert transcriptions, not behaviour we chose. Each case is the legacy expression applied
 * to the same input, so a drift here is a visible parity regression on the Dashboard.
 */

describe('truncate', () => {
  it('leaves content at or below the limit untouched', () => {
    const exact = 'a'.repeat(CONTENT_TRUNCATE_LENGTH);
    expect(truncate(exact)).toBe(exact);
    expect(truncate('short')).toBe('short');
  });

  it('cuts at 80 characters and appends a single ellipsis character', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long);
    expect(result).toBe(`${'a'.repeat(80)}\u2026`);
    // 80 characters plus one ellipsis, not three dots.
    expect(result).toHaveLength(81);
  });

  it('handles an empty string', () => {
    expect(truncate('')).toBe('');
  });
});

describe('senderHandle', () => {
  it('drops the homeserver from a Matrix id', () => {
    expect(senderHandle('@alice:example.org')).toBe('@alice');
  });

  it('returns the whole value when there is no colon', () => {
    expect(senderHandle('alice')).toBe('alice');
  });

  it('keeps only the first segment when there are several colons', () => {
    expect(senderHandle('@alice:example.org:8448')).toBe('@alice');
  });
});

describe('humanizeStatus', () => {
  it('title-cases and unscores bridge statuses', () => {
    expect(humanizeStatus('logged_out')).toBe('Logged Out');
    expect(humanizeStatus('connected')).toBe('Connected');
    expect(humanizeStatus('disconnected')).toBe('Disconnected');
  });

  it('falls back to Unknown for null and empty input', () => {
    expect(humanizeStatus(null)).toBe('Unknown');
    expect(humanizeStatus(undefined)).toBe('Unknown');
    expect(humanizeStatus('')).toBe('Unknown');
  });
});

describe('formatCount', () => {
  it('renders zero for null and undefined, as the KPI cards did', () => {
    expect(formatCount(null)).toBe('0');
    expect(formatCount(undefined)).toBe('0');
    expect(formatCount(0)).toBe('0');
  });
});
