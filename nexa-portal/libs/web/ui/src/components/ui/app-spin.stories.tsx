import type { Meta, StoryObj } from '@storybook/react';
import { AppSpin } from './app-spin';

const meta: Meta<typeof AppSpin> = {
  title: 'UI/AppSpin',
  component: AppSpin,
};

export default meta;
type Story = StoryObj<typeof AppSpin>;

/** Spinner only: no tip, no description, no adjacent copy. See rule 8. */
export const Section: Story = {};
export const FullPage: Story = { args: { fullPage: true } };
