import { AppButton, FormFieldWrapper } from '@nexa/shared-ui';
import { Card, Input, Result, Typography } from 'antd';
import { AppIcon } from '../../../app/app-icon';
import { FeaturePageShell } from '../../../app/components/feature-page-shell';
import { OnboardModuleStyles } from '../components/onboard-module-styles';
import { OnboardSteps } from '../components/onboard-steps';
import { QrPanel } from '../components/qr-panel';
import { useWhatsappOnboarding } from '../hooks/use-whatsapp-onboarding';

const { Text } = Typography;

/**
 * WhatsApp onboarding. Four phases, same copy and same transitions as `Onboard.tsx`.
 *
 * The User ID field is intentionally not a React Hook Form field: it has no validation at all in
 * the legacy screen (blank falls back to the literal `'default'`), so a resolver would reject
 * input the current screen accepts.
 */
export function OnboardPage() {
  const { userId, setUserId, phase, qr, error, isStarting, start, cancel, reset, tryAgain } =
    useWhatsappOnboarding();

  return (
    <>
      <OnboardModuleStyles />
      <FeaturePageShell
        title="Connect WhatsApp"
        description="Link a WhatsApp account so Nexa can receive and classify messages."
      >
        <div className="onboard-stack">
          <div className="onboard-layout">
            <Card className="onboard-panel">
              <div>
                <h3 className="onboard-panel__title">How it works</h3>
                <p className="onboard-panel__subtitle">
                  Follow these steps on this page and on your phone.
                </p>
              </div>
              <OnboardSteps phase={phase} />
            </Card>

            <Card className="onboard-panel">
              {phase === 'idle' ? (
                <div className="onboard-action">
                  <div>
                    <h3 className="onboard-panel__title">Start linking</h3>
                    <p className="onboard-panel__subtitle">
                      Use any label you will recognize later. Leave blank to use{' '}
                      <Text code>default</Text>.
                    </p>
                  </div>

                  <FormFieldWrapper label="User ID" htmlFor="onboard-user-id">
                    <Input
                      id="onboard-user-id"
                      size="large"
                      value={userId}
                      onChange={(event) => setUserId(event.target.value)}
                      placeholder="e.g. alice"
                      prefix={<AppIcon name="whatsapp" size={16} />}
                      onPressEnter={() => void start()}
                      autoFocus
                    />
                  </FormFieldWrapper>

                  <div className="onboard-action__footer">
                    <AppButton
                      type="primary"
                      size="large"
                      loading={isStarting}
                      icon={<AppIcon name="play" size={16} />}
                      onClick={() => void start()}
                    >
                      Start onboarding
                    </AppButton>
                  </div>
                </div>
              ) : null}

              {phase === 'scanning' ? <QrPanel qr={qr} onCancel={cancel} /> : null}

              {phase === 'connected' ? (
                <div className="onboard-result">
                  <Result
                    status="success"
                    title="WhatsApp connected!"
                    subTitle="Messages will now be classified automatically."
                    extra={
                      <AppButton
                        type="primary"
                        size="large"
                        icon={<AppIcon name="qrCode" size={16} />}
                        onClick={reset}
                      >
                        Connect another
                      </AppButton>
                    }
                  />
                </div>
              ) : null}

              {phase === 'error' ? (
                <div className="onboard-action">
                  <div>
                    <h3 className="onboard-panel__title">Could not connect</h3>
                    <p className="onboard-panel__subtitle">
                      Something went wrong while linking WhatsApp. You can try again.
                    </p>
                  </div>
                  <Text type="danger" className="text-[13px]">
                    {error}
                  </Text>
                  <div className="onboard-action__footer">
                    <AppButton
                      type="primary"
                      size="large"
                      icon={<AppIcon name="refresh" size={16} />}
                      onClick={tryAgain}
                    >
                      Try again
                    </AppButton>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      </FeaturePageShell>
    </>
  );
}
