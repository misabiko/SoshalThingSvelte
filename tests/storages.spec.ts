import {expect, test, type Page} from '@playwright/test'

//TODO import from ../src/storages.js
export const MAIN_STORAGE_KEY = 'SoshalThingSvelte'
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines'

test.describe('app options', () => {
	test('fullscreen true', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: true
			},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		})

		await expect(page.locator('.timeline').first()).toHaveClass(/fullscreenTimeline/);
	});
	test('fullscreen false', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: false
			},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		})

		await expect(page.locator('.timeline').first()).not.toHaveClass(/fullscreenTimeline/);
	});
	test('fullscreen index', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: 1
			},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		})

		await expect(page.locator('.timeline').nth(1)).toHaveClass(/fullscreenTimeline/);
	});
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

	test.describe.only('endpoint', () => {
		test('without endpoint', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [{}],
			});

			const endpointOptionGroup = page.locator('.timelineOptions box', {hasText: 'Endpoints'})

			await expect(endpointOptionGroup.locator('ul > *')).toHaveCount(0);
			//TODO Assert sidebar
		});

		test('with endpoints', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [{
					endpoints: [
						{
							service: 'Dummy',
							endpointType: 0,
						},
						{
							service: 'Dummy',
							endpointType: 1,
						}
					]
				}],
			});

			const endpointOptionGroup = page.locator('.timelineOptions box', {hasText: 'Endpoints'})

			const endpointList = endpointOptionGroup.locator('ul > *');
			await expect(endpointList).toHaveCount(2);
			//TODO Assert sidebar
		});

		test('with duplicate non-duplicatable endpoints', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [{
					endpoints: [
						{
							service: 'Dummy',
							endpointType: 0,
						},
						{
							service: 'Dummy',
							endpointType: 0,
						}
					]
				}],
			});

			const endpointOptionGroup = page.locator('.timelineOptions box', {hasText: 'Endpoints'})

			const endpointList = endpointOptionGroup.locator('ul > *');
			await expect(endpointList).toHaveCount(1);
			//TODO Assert sidebar
		});
	});
})

export async function loadWithLocalStorage(page: Page, storages: {[key: string]: any}) {
	await page.goto('/');
	await page.mainFrame().evaluate((storages) => {
		for (const [key, storage] of Object.entries(storages))
			window.localStorage.setItem(key, JSON.stringify(storage));
	}, storages);
	await page.reload();
}

export async function clearLocalStorages(page: Page, keys: string[]) {
	await page.goto('/');
	await page.mainFrame().evaluate((keys) => {
		for (const key of keys)
			window.localStorage.removeItem(key);
	}, keys);
	await page.reload();
}