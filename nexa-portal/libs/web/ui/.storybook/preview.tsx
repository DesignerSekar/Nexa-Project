import { DEFAULT_APP_CONFIG } from '@nexa/theme-web';
import type { Preview } from '@storybook/react';
import { AppConfigProvider } from '../src/providers/app-config-provider';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story) => (
      <AppConfigProvider config={DEFAULT_APP_CONFIG}>
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </AppConfigProvider>
    ),
  ],
};

export default preview;
