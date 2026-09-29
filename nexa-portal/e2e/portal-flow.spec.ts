import { expect, test } from '@playwright/test';
import { navigateTo, openNav, signIn } from './helpers';

/**
 * The one flow that has to keep working end to end: sign in, read the dashboard, walk the
 * sidebar, and disconnect a bridge.
 *
 * Deliberately shallow on assertions about copy — those are covered by the component tests. What
 * this proves is that the router guards, the cookie session, and the provider chain hold together
 * in a real browser against a real production build. It runs on both a desktop and a mobile
 * viewport, so the drawer nav is covered too.
 */

test('signs in and lands on the dashboard', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('AI message routing for WhatsApp & LinkedIn')).toBeVisible();

  await page.getByLabel(/Email/).fill('jane@example.com');
  await page.getByLabel(/Password/).fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/app\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Total messages')).toBeVisible();
  await expect(page.getByText('Recent messages')).toBeVisible();
});

test('navigates the sidebar and disconnects a bridge', async ({ page }) => {
  await signIn(page);

  await navigateTo(page, 'Bridges');
  await expect(page).toHaveURL(/\/app\/bridges/);
  await expect(page.getByText('Manage connected messaging platforms.')).toBeVisible();

  // No confirmation dialog: the legacy button fired immediately. See DP-003.
  await page.getByRole('button', { name: /Disconnect/ }).click();
  await expect(page.getByText('Disconnected successfully.')).toBeVisible();

  await navigateTo(page, 'WhatsApp');
  await expect(page).toHaveURL(/\/app\/onboard\/whatsapp/);
  await expect(page.getByRole('heading', { name: 'Connect WhatsApp' })).toBeVisible();
});

test('reaches the QR screen and can cancel back to idle', async ({ page }) => {
  await signIn(page);
  await page.goto('/app/onboard/whatsapp');

  await page.getByRole('button', { name: 'Start onboarding' }).click();

  await expect(page.getByAltText('QR code')).toBeVisible();
  await expect(page.getByText(/QR refreshes every 18 s/)).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'Start onboarding' })).toBeVisible();
});

test('signing out returns to the login screen', async ({ page }) => {
  await signIn(page);

  await openNav(page);
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/login/);
});

test('keeps the legacy /bridges URL working', async ({ page }) => {
  await signIn(page);

  await page.goto('/bridges');
  await expect(page).toHaveURL(/\/app\/bridges/);
});

test('keeps the legacy /onboard URL working', async ({ page }) => {
  await signIn(page);

  await page.goto('/onboard');
  await expect(page).toHaveURL(/\/app\/onboard\/whatsapp/);
});

test('sends the OAuth callback landing at / on to the dashboard', async ({ page }) => {
  await signIn(page);

  await page.goto('/');
  await expect(page).toHaveURL(/\/app\/dashboard/);
});

test('toggles dark mode and persists it across a reload', async ({ page }) => {
  await signIn(page);

  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
