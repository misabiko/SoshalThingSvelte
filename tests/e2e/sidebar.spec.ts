import {expect, test} from '@playwright/test';
import { TIMELINE_STORAGE_KEY } from '../storagesUtils';

//TODO Move add timeline to dedicated spec file
test('Add Timeline', async ({page}) => {
	await page.goto('/');

	await page.click('#sidebarButtons button[title = "Add new timeline"]');

	await expect(page.locator('.sidebarMenu label')).toContainText('Add Timeline');
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

	await page.fill('.sidebarMenu input[name = "title"]', 'test');

	await page.click('.sidebarMenu button:text("Add Timeline")');

	await expect(page.locator('.timeline')).toHaveCount(1);

	await expect(page.locator('.timeline .timelineLeftHeader > strong')).toHaveText('test');
});

test('Add Timeline local storage', async ({page}) => {
	await page.goto('/');

	await page.click('#sidebarButtons button[title = "Add new timeline"]');

	await page.click('.sidebarMenu button:text("Add Timeline")');

	const storageStr = await page.mainFrame().evaluate((key) => {
		return window.localStorage.getItem(key);
	}, TIMELINE_STORAGE_KEY);

	expect(storageStr).not.toBeNull();

	const storage = JSON.parse(storageStr as string);

	expect(Object.entries(storage)).toHaveLength(1);
	expect(storage).toHaveProperty('Timeline 0');
});

//TODO Add TimelineEditMenu component tests in tests/components folder