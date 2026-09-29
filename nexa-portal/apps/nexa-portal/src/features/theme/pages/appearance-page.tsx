import { LIGHT_PALETTE } from '@nexa/tokens';
import { AppButton, FormFieldWrapper } from '@nexa/shared-ui';
import { Card, ColorPicker, Segmented } from 'antd';
import { FeaturePageShell } from '../../../app/components/feature-page-shell';
import { useAppConfigStore } from '../stores/app-config.store';

/**
 * Appearance settings.
 *
 * Purely client-side: everything here writes to `localStorage` through the `KeyValueStore` port
 * and issues no request, so it cannot affect parity of any existing flow. This screen is new —
 * the legacy app had no settings at all — and is part of the agreed "parity plus shell" scope.
 */
export function AppearancePage() {
  const {
    themeMode,
    primaryColor,
    density,
    fontFamily,
    setThemeMode,
    setPrimaryColor,
    setDensity,
    setFontFamily,
    reset,
  } = useAppConfigStore();

  return (
    <FeaturePageShell
      title="Appearance"
      description="These preferences are stored in this browser only."
      actions={<AppButton onClick={reset}>Reset to defaults</AppButton>}
    >
      <Card>
        <div className="flex flex-col gap-6">
          <FormFieldWrapper label="Theme">
            <Segmented
              size="large"
              value={themeMode}
              onChange={(value) => setThemeMode(value as typeof themeMode)}
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System', value: 'system' },
              ]}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Accent colour">
            <div className="flex items-center gap-3">
              <ColorPicker
                size="large"
                value={primaryColor ?? LIGHT_PALETTE.colorPrimary}
                onChangeComplete={(color) => setPrimaryColor(color.toHexString())}
                showText
              />
              {primaryColor ? (
                <AppButton type="link" onClick={() => setPrimaryColor(null)}>
                  Use default
                </AppButton>
              ) : null}
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper label="Density">
            <Segmented
              size="large"
              value={density}
              onChange={(value) => setDensity(value as typeof density)}
              options={[
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Comfortable', value: 'comfortable' },
              ]}
            />
          </FormFieldWrapper>

          <FormFieldWrapper label="Font">
            <Segmented
              size="large"
              value={fontFamily}
              onChange={(value) => setFontFamily(value as typeof fontFamily)}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Inter', value: 'inter' },
                { label: 'Mono', value: 'mono' },
              ]}
            />
          </FormFieldWrapper>
        </div>
      </Card>
    </FeaturePageShell>
  );
}
