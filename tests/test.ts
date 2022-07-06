import { expect, test } from '@playwright/test';

test('has timeline', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('.timeline')).toHaveCount(1);
});
