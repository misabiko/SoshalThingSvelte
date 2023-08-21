import {expect, test} from '@playwright/test';

test('Add Timeline', async ({page}) => {
	await page.goto('/');

	await page.click('#sidebarButtons button[title = "Add new timeline"]');

	await expect(page.locator('.sidebarMenu label')).toContainText('Username');
});

test('Add Timeline adds a timeline', async ({page}) => {
	await page.goto('/');

	await page.click('#sidebarButtons button[title = "Add new timeline"]');

	await page.click('.sidebarMenu button:text("Add Timeline")');

	await expect(page.locator('.timeline')).toHaveCount(1);
});

test('Add Timeline title', async ({page}) => {
	await page.goto('/');

	await page.click('#sidebarButtons button[title = "Add new timeline"]');

	await page.fill('.sidebarMenu input[name = "username"]', 'test');

	await page.click('.sidebarMenu button:text("Add Timeline")');

	await expect(page.locator('.timeline')).toHaveCount(1);

	await expect(page.locator('.timeline .timelineLeftHeader > strong')).toHaveText('test');
});