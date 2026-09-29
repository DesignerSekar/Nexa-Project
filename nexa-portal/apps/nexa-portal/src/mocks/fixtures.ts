import type { Message, Stats, User } from '@nexa/contract';

/**
 * Fixtures shaped like real sidecar responses, including the fields no screen renders
 * (`classifier_breakdown`, `timestamp`, `confidence`, `count`, `bridge_bot`). Keeping them here
 * means a test that starts rendering one will be visible in review.
 */

export const mockUser: User = {
  id: 1,
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555 000 0000',
};

export const mockStats: Stats = {
  total_messages: 1284,
  pending_actions: 7,
  priority_breakdown: { HIGH: 12, MEDIUM: 48, LOW: 133 },
  classifier_breakdown: { ENQUIRY: 90, INTENT: 40, PROMOTION: 33, SOCIAL: 30 },
  classifier: 'gpt-4o-mini',
};

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    platform: 'whatsapp',
    sender: '@alice:example.org',
    content: 'Hi, do you ship to Germany?',
    timestamp: 1_735_689_600,
    classification: 'ENQUIRY',
    confidence: 0.94,
  },
  {
    id: 'msg-2',
    platform: 'linkedin',
    sender: '@bob:example.org',
    // Deliberately over 80 characters, so the truncation assertion has something to bite on.
    content:
      'Following up on my previous note about the enterprise plan and whether we can arrange a call next week to discuss pricing.',
    timestamp: 1_735_693_200,
    classification: 'INTENT',
    confidence: 0.81,
  },
  {
    id: 'msg-3',
    platform: 'whatsapp',
    sender: '@carol:example.org',
    content: 'Thanks!',
    timestamp: 1_735_696_800,
    classification: null,
    confidence: null,
  },
];
