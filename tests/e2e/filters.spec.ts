import {expect, test} from '@playwright/test';
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from '../storagesUtils';

test.describe('mark as read', () => {
	test.beforeEach(async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {t1: {
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 'DummyEndpoint',
					},
				],
				filters: [
					{
						filter: {type: 'notMarkedAsRead', service: null},
						enabled: true,
						inverted: false,
					},
				],
			}},
		});
	});

	test('mark as read', async ({page}) => {
		const articleLocator = page.locator('article');
		const articleCount = await articleLocator.count();
		expect(articleCount).toBeGreaterThan(0);

		await page.locator('article button.articleButton[title = "Mark as read"]').first().click();

		await expect(articleLocator).toHaveCount(articleCount - 1);
	});
});

test('missing optional props field should be added', async ({page}) => {
	page.on('pageerror', msg => {
		throw msg;
	});

	await loadWithLocalStorage(page, {
		[TIMELINE_STORAGE_KEY]: {t1: {
			endpoints: [
				{
					service: 'Dummy',
					endpointType: 'DummyEndpoint',
				},
			],
			filters: [
				{
					filter: {
						type: 'repost',
						service: null,
						//no `props: {byUsername}`
					},
					enabled: true,
					inverted: false,
				},
			],
		}},
	});

	await page.click('.timeline button[title = "Expand options"]');
});

test.skip('repost by username', async () => {
	//TODO
});

test.skip('quote by username', async () => {
	//TODO
});