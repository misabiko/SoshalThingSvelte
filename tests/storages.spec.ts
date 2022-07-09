import {expect, test, type Page} from '@playwright/test'

//TODO import from ../src/storages.js
const MAIN_STORAGE_KEY = 'SoshalThingSvelte'
const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines'

test.describe('app options', () => {

})

test.describe('timelines', () => {
	test("no storage doesn't add any timelines", async ({ page }) => {
		await clearLocalStorages(page, [TIMELINE_STORAGE_KEY]);

		await expect(page.locator('.timeline')).toHaveCount(0);
	});

	test("empty objects add empty timelines", async ({ page }) => {
		await loadWithLocalStorage(page, {[TIMELINE_STORAGE_KEY]: [{}, {}, {}, {}]});

		await expect(page.locator('.timeline')).toHaveCount(4);
	});

	test('title', async ({ page }) => {
		const title = 'Timeline Title';

		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [
				{'title': title},
			],
		});

		await expect(page.locator('.timelineLeftHeader strong')).toHaveText(title);
	});
})

async function loadWithLocalStorage(page: Page, storages: {[key: string]: any}) {
	await page.goto('/');
	await page.mainFrame().evaluate((storages) => {
		for (const [key, storage] of Object.entries(storages))
			window.localStorage.setItem(key, JSON.stringify(storage));
	}, storages);
	await page.reload();
}

async function clearLocalStorages(page: Page, keys: string[]) {
	await page.goto('/');
	await page.mainFrame().evaluate((keys) => {
		for (const key of keys)
			window.localStorage.removeItem(key);
	}, keys);
	await page.reload();
}