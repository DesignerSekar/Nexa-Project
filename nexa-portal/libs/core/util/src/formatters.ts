import { DateTime } from 'luxon';

/**
 * Formatters for the Dashboard.
 *
 * `truncate` and `senderHandle` are not general-purpose helpers: they reproduce two exact
 * transformations the legacy recent-messages table performs inline. Both are asserted in tests
 * because getting them subtly wrong is invisible in review.
 */

/** Numbers in the KPI cards. The legacy screen renders them raw, so grouping is the only change. */
export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat().format(value);
}

/**
 * `m.content.length > 80 ? m.content.slice(0, 80) + '…' : m.content`
 *
 * Note this counts UTF-16 code units, exactly as `String.prototype.slice` does in the original.
 */
export const CONTENT_TRUNCATE_LENGTH = 80;

export function truncate(value: string, maxLength: number = CONTENT_TRUNCATE_LENGTH): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}\u2026` : value;
}

/**
 * `m.sender.split(':')[0]`
 *
 * Matrix senders look like `@alice:example.org`; the legacy table shows the part before the colon.
 */
export function senderHandle(sender: string): string {
  return sender.split(':')[0];
}

/**
 * `s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())`
 *
 * Bridge status labels: `logged_out` becomes `Logged Out`.
 */
export function humanizeStatus(status: string | null | undefined, fallback = 'Unknown'): string {
  if (!status) return fallback;
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Epoch seconds to a readable timestamp.
 *
 * Not used by any screen today, because no screen renders `Message.timestamp` (DP-005). It lives
 * here so the formatter is ready and tested when that proposal is picked up.
 */
export function formatTimestamp(epochSeconds: number, format = 'dd LLL yyyy, HH:mm'): string {
  return DateTime.fromSeconds(epochSeconds).toFormat(format);
}

export function formatRelative(epochSeconds: number): string {
  return DateTime.fromSeconds(epochSeconds).toRelative() ?? '';
}
