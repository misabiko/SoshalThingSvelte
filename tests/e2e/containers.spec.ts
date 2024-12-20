import test, {expect} from '@playwright/test';
import {loadWithLocalStorage, MAIN_STORAGE_KEY, TIMELINE_STORAGE_KEY} from '../storagesUtils';

test.describe('masonry', () => {
	test('independant columns', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {t1: {
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 'DummyEndpoint',
					},
				],
				container: 'Masonry',
				columnCount: 3,
				width: 2,
			}},
		});

		const column = page.locator('.masonryColumn');
		await expect(column).toHaveCount(3);

		for (let i = 0; i < 3; ++i)
			for (let j = i; j < 10; j += 3)
				await expect(column.nth(i).locator(`.articleParagraph >> text=bleh${j}`)).toHaveCount(1);

		await column.first().locator('article button.articleButton[title = "Mark as read"]').first().click();

		for (let i = 0; i < 3; ++i)
			for (let j = i; j < 10; j += 3)
				if (j !== 0)
					await expect(column.nth(i).locator(`.articleParagraph >> text=bleh${j}`)).toHaveCount(1);
	});

	test.describe('balance button', () => {
		test('available on normal container', async ({page}) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: {t1: {
					endpoints: [
						{
							service: 'Dummy',
							endpointType: 'DummyEndpoint',
						},
					],
					container: 'Masonry',
				}},
			});

			await expect(page.getByRole('button', {name: 'Organize Container'})).toBeVisible();
		});

		test('available on fullscreen container', async ({page}) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: {t1: {
					endpoints: [
						{
							service: 'Dummy',
							endpointType: 'DummyEndpoint',
						},
					],
				}},
				[MAIN_STORAGE_KEY]: {
					fullscreen: {
						container: 'Masonry',
					},
				},
			});

			await page.getByRole('button', {name: 'Make timeline fullscreen'}).click();

			await expect(page.getByRole('button', {name: 'Organize Container'})).toBeVisible();
		});
	});
});