import {expect, test, type Page} from '@playwright/test'

//TODO import from ../src/storages.js
const TIMELINE_STORAGE_KEY = 'SoshalThingSvelte Timelines'

test('empty', async ({ page }) => {
	await evaluateFrame(page, (key: string) => {
		window.localStorage.removeItem(key);
	});

	await expect(page.locator('.timeline')).toHaveCount(0);
});

test('title', async ({ page }) => {
	const title = 'Timeline Title';

	await loadWithLocalStorage(page, [
		{'title': title}
	]);

	await expect(page.locator('.timelineLeftHeader strong')).toHaveText(title);
});

async function loadWithLocalStorage(page: Page, storage: any) {
	await page.goto('/');
	await page.mainFrame().evaluate(([key, storage]) => {
		window.localStorage.setItem(key, JSON.stringify(storage));
	}, [TIMELINE_STORAGE_KEY, storage]);
	await page.reload();
}

async function evaluateFrame(page: Page, pageFunction: (key: string) => void) {
	await page.goto('/');
	await page.mainFrame().evaluate(pageFunction, TIMELINE_STORAGE_KEY);
	await page.reload();
}