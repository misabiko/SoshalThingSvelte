import {expect, test, type Page} from '@playwright/test'

//TODO import from ../src/storages.js
export const MAIN_STORAGE_KEY = 'SoshalThingSvelte'
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines'

test.describe('app options', () => {
	test('fullscreen undefined', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		})

		await expect(page.locator('.timeline')).toHaveCount(3)
		await expect(page.locator('.fullscreenTimeline')).toHaveCount(0)
	})

	test('fullscreen true', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: true
			},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		})

		const timeline = page.locator('.timeline')
		await expect(timeline).toHaveCount(1)
		await expect(timeline).toHaveClass(/fullscreenTimeline/)
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

		await expect(page.locator('.timeline')).toHaveCount(3)
		await expect(page.locator('.fullscreenTimeline')).toHaveCount(0)
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

		const timeline = page.locator('.timeline')
		await expect(timeline).toHaveCount(1)
		await expect(timeline).toHaveClass(/fullscreenTimeline/)
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
				{title},
			],
		});

		await expect(page.locator('.timelineLeftHeader strong')).toHaveText(title);
	});

	test('masonry container', async ({ page }) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [
				{container: 'Masonry'},
			],
		});

		await expect(page.locator('.masonryContainer')).toHaveCount(1);
	});

	test.describe('endpoints', () => {
		test('without endpoint', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [{}],
			});

			await page.click('.timeline .timelineButtons button[title = "Expand options"]');

			const endpointOptionGroup = page.locator('.timelineOptions .box', {hasText: 'Endpoints'})

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
							params: {
								query: 'querystring'
							}
						}
					]
				}],
			});

			await page.click('.timeline .timelineButtons button[title = "Expand options"]');

			const endpointOptionGroup = page.locator('.timelineOptions .box', {hasText: 'Endpoints'})

			const endpointList = endpointOptionGroup.locator('ul > *');
			await expect(endpointList).toHaveCount(2);
			//TODO Assert sidebar
		});

		test('with duplicate non-duplicatable endpoints', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [
					{
						endpoints: [
							{
								service: 'Dummy',
								endpointType: 0,
							},
							{
								service: 'Dummy',
								endpointType: 0,
							},
						],
					}, {
						endpoints: [
							{
								service: 'Dummy',
								endpointType: 0,
							},
							{
								service: 'Dummy',
								endpointType: 0,
							},
						],
					}],
			})

			for (const i of [1, 2]) {
				await page.click(`.timeline:nth-child(${i}) .timelineButtons button[title = "Expand options"]`)

				const endpointOptionGroup = page.locator('.timelineOptions .box', {hasText: 'Endpoints'})

				const endpointList = endpointOptionGroup.locator('ul > *')
				await expect(endpointList).toHaveCount(1)

				await page.click(`.timeline:nth-child(${i}) .timelineButtons button[title = "Expand options"]`)
			}

			//TODO Assert sidebar
		});
	});
})

test.describe('cache', () => {
	test.beforeEach(async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 0,
					}
				]
			}]
		})
	})

	test.only('mark as read is properly loaded', async ({page}) => {
		const articleLocator = page.locator('article')
		const articleCount = await articleLocator.count()
		expect(articleCount).toBeGreaterThan(0)

		await page.locator('article button.articleButton[title = "Mark as read"]').first().click();

		await expect(articleLocator).toHaveCount(articleCount - 1);

		await page.reload()

		await expect(articleLocator).toHaveCount(articleCount - 1);
	})

	test('hidden is properly loaded', async ({page}) => {
		const articleLocator = page.locator('article')
		const articleCount = await articleLocator.count()
		expect(articleCount).toBeGreaterThan(0)

		await page.locator('article .dropdown-trigger button.articleButton').first().click();

		await page.locator('article a.dropdown-item >> text=Hide').first().click();

		await expect(articleLocator).toHaveCount(articleCount - 1);

		await page.reload()

		await expect(articleLocator).toHaveCount(articleCount - 1);
	})
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