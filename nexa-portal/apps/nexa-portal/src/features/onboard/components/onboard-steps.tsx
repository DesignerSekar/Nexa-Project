import { AppIcon } from '../../../app/app-icon';
import type { OnboardPhase } from '../hooks/use-whatsapp-onboarding';

/** The four numbered lines from the idle state, verbatim. */
const STEPS = [
  'Enter a user ID (any label, e.g. your name)',
  'Click Start onboarding \u2014 a QR code will appear',
  'Open WhatsApp on your phone \u2192 Linked devices \u2192 Link a device',
  'Scan the QR code',
] as const;

interface OnboardStepsProps {
  phase: OnboardPhase;
}

/** Map phase → first incomplete step index (0-based). Connected ⇒ all complete. */
function activeStepIndex(phase: OnboardPhase): number {
  switch (phase) {
    case 'idle':
      return 0;
    case 'scanning':
      return 3;
    case 'connected':
      return 4;
    case 'error':
      return 0;
    default:
      return 0;
  }
}

export function OnboardSteps({ phase }: OnboardStepsProps) {
  const active = activeStepIndex(phase);

  return (
    <ol className="onboard-guide-list" aria-label="How to connect WhatsApp">
      {STEPS.map((step, index) => {
        const done = index < active;
        const isActive = index === active;
        const itemClass = [
          'onboard-guide-item',
          done ? 'onboard-guide-item--done' : '',
          isActive ? 'onboard-guide-item--active' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={step} className={itemClass}>
            <span className="onboard-guide-item__index" aria-hidden>
              {done ? <AppIcon name="check" size={14} /> : index + 1}
            </span>
            <span className="onboard-guide-item__text">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
