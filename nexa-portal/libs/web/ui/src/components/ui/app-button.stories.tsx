import type { Meta, StoryObj } from '@storybook/react';
import { AppButton } from './app-button';

const meta: Meta<typeof AppButton> = {
  title: 'UI/AppButton',
  component: AppButton,
  args: { children: 'Sign in' },
};

export default meta;
type Story = StoryObj<typeof AppButton>;

export const Primary: Story = { args: { type: 'primary', size: 'large' } };
export const Danger: Story = { args: { type: 'primary', danger: true, children: 'Disconnect' } };
export const Loading: Story = {
  args: { type: 'primary', loading: true, children: 'Please wait\u2026' },
};
export const Default: Story = {};
