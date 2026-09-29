import { expect, type Page } from '@playwright/test';

export async function signIn(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/Email/).fill('jane@example.com');
  await page.getByLabel(/Password/).fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
}

/**
 * Below the `web` tier the nav rail lives in a drawer, so the suite has to open it first. Written
 * as a helper rather than skipping the mobile project, because the drawer is the part most likely
 * to break.
 */
export async function openNav(page: Page): Promise<void> {
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) {
    await menu.click();
  }
}

export async function navigateTo(page: Page, label: string): Promise<void> {
  await openNav(page);
  await page.getByRole('link', { name: label }).click();
}
