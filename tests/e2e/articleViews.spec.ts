import test, {expect} from '@playwright/test';
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from '../storagesUtils';

test.describe('SocialArticleView', () => {
	test('like feedback', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {t1: {
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 'DummyEndpoint',
					}
				]
			}}
		});

		await page.locator('article button[title = "Like"]').first().click();

		await expect(page.locator('article button[title = "Like"]').first()).toHaveClass(/actionned/);
	});

	test('repost feedback', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {t1: {
				title: 'Timeline',
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 'DummyEndpoint',
					}
				]
			}}
		});

		await page.locator('article button[title = "Repost"]').first().click();

		await expect(page.locator('article button[title = "Repost"]').first()).toHaveClass(/actionned/);
	});
});