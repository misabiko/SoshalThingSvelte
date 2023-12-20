import {expect, test} from '@playwright/test';
import {MAIN_STORAGE_KEY, TIMELINE_STORAGE_KEY, loadWithLocalStorage, clearLocalStorages} from '../storagesUtils';

test.describe('app options', () => {
	test('fullscreen undefined', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		});

		await expect(page.locator('.timeline')).toHaveCount(3);
		await expect(page.locator('.fullscreenTimeline')).toHaveCount(0);
	});

	test('fullscreen true', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: true
			},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		});

		const timeline = page.locator('.timeline');
		await expect(timeline).toHaveCount(1);
		await expect(timeline).toHaveClass(/fullscreenTimeline/);
	});
	test('fullscreen false', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: false
			},
			[TIMELINE_STORAGE_KEY]: [
				{}, {}, {}
			]
		});

		await expect(page.locator('.timeline')).toHaveCount(3);
		await expect(page.locator('.fullscreenTimeline')).toHaveCount(0);
	});

	test('fullscreen index', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				fullscreen: 1
			},
			[TIMELINE_STORAGE_KEY]: [
				{title: 'Timeline 1'},
				{title: 'Timeline 2'},
				{title: 'Timeline 3'},
			]
		});

		const timeline = page.locator('.timeline');
		await expect(timeline).toHaveCount(1);
		await expect(timeline).toHaveClass(/fullscreenTimeline/);
		await expect(timeline.locator('.timelineLeftHeader strong')).toHaveText('Timeline 2');
	});

	test('timelineIds', async ({page}) => {
		await loadWithLocalStorage(page, {
			[MAIN_STORAGE_KEY]: {
				timelineIds: [0, 2]
			},
			[TIMELINE_STORAGE_KEY]: [
				{title: 'Timeline 1'},
				{title: 'Timeline 2'},
				{title: 'Timeline 3'},
			]
		});

		const timeline = page.locator('.timeline');
		await expect(timeline).toHaveCount(2);
		await expect(timeline.nth(0).locator('.timelineLeftHeader strong')).toHaveText('Timeline 1');
		await expect(timeline.nth(1).locator('.timelineLeftHeader strong')).toHaveText('Timeline 3');
	});
});

test.describe('timelines', () => {
	test("no storage doesn't add any timelines", async ({ page }) => {
		await clearLocalStorages(page, [TIMELINE_STORAGE_KEY]);

		await expect(page.locator('.timeline')).toHaveCount(0);
	});

	test('empty objects add empty timelines', async ({ page }) => {
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
			[TIMELINE_STORAGE_KEY]: [{
				container: 'Masonry',
				endpoints: [{
					service: 'Dummy',
					endpointType: 'DummyEndpoint',
				}],
			}],
		});

		await expect(page.locator('.masonryContainer')).toHaveCount(1);
	});

	test.describe('endpoints', () => {
		test('without endpoint', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [{}],
			});

			await page.click('.timeline .timelineButtons button[title = "Expand options"]');

			const endpointOptionGroup = page.locator('.timelineOptions section', {hasText: 'Endpoints'});

			await expect(endpointOptionGroup.locator('ul > *')).toHaveCount(0);

			await page.click('#sidebarButtons button[title = "Endpoints"]');

			await expect(page.locator('.sidebarMenu')).toHaveText('No endpoints currently');
		});

		test('with endpoints', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [{
					endpoints: [
						{
							service: 'Dummy',
							endpointType: 'DummyEndpoint',
						},
						{
							service: 'Dummy',
							endpointType: 'DummyEndpointWithParam',
							params: {
								query: 'querystring'
							}
						}
					]
				}],
			});

			await page.click('.timeline .timelineButtons button[title = "Expand options"]');

			const endpointOptionGroup = page.locator('.timelineOptions section', {hasText: 'Endpoints'});

			const endpointList = endpointOptionGroup.locator('ul > *');
			await expect(endpointList).toHaveCount(2);

			await page.click('#sidebarButtons button[title = "Endpoints"]');

			await expect(page.locator('.sidebarMenu .endpointOptions')).toHaveCount(2);
		});

		test('with duplicate non-duplicatable endpoints', async ({ page }) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: [
					{
						endpoints: [
							{
								service: 'Dummy',
								endpointType: 'DummyEndpoint',
							},
							{
								service: 'Dummy',
								endpointType: 'DummyEndpoint',
							},
						],
					}, {
						endpoints: [
							{
								service: 'Dummy',
								endpointType: 'DummyEndpoint',
							},
							{
								service: 'Dummy',
								endpointType: 'DummyEndpoint',
							},
						],
					}],
			});

			for (const i of [1, 2]) {
				await page.click(`.timeline:nth-child(${i}) .timelineButtons button[title = "Expand options"]`);

				const endpointOptionGroup = page.locator('.timelineOptions section', {hasText: 'Endpoints'});

				const endpointList = endpointOptionGroup.locator('ul > *');
				await expect(endpointList).toHaveCount(1);

				await page.click(`.timeline:nth-child(${i}) .timelineButtons button[title = "Expand options"]`);
			}

			await page.click('#sidebarButtons button[title = "Endpoints"]');

			await expect(page.locator('.sidebarMenu .endpointOptions')).toHaveCount(1);
		});
	});
});

test.describe('cache', () => {
	test.beforeEach(async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 'DummyEndpoint',
					}
				]
			}]
		});
	});

	test('mark as read is properly loaded', async ({page}) => {
		const articleLocator = page.locator('article');
		const articleCount = await articleLocator.count();
		expect(articleCount).toBeGreaterThan(0);

		await page.locator('article button.articleButton[title = "Mark as read"]').first().click();

		await expect(articleLocator).toHaveCount(articleCount - 1);

		await page.reload();

		await expect(articleLocator).toHaveCount(articleCount - 1);
	});

	test('hidden is properly loaded', async ({page}) => {
		const articleLocator = page.locator('article');
		const articleCount = await articleLocator.count();
		expect(articleCount).toBeGreaterThan(0);

		await page.locator('article .dropdown-trigger button.articleButton').first().click();

		await page.locator('article button.dropdown-item >> text=Hide').first().click();

		await expect(articleLocator).toHaveCount(articleCount - 1);

		await page.reload();

		await expect(articleLocator).toHaveCount(articleCount - 1);
	});
});