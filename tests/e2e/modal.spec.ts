import {expect, test} from '@playwright/test';
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from '../storagesUtils';

test.skip('modal timeline is full height', async ({page}) => {
	//TODO Open modal timeline

	const modalContent = page.locator('.modal-content');
	await expect(modalContent.locator('.timeline')).toHaveCount(1);

	expect(await modalContent.evaluate(e => e.scrollHeight - e.clientHeight)).toStrictEqual(0);
});

test('filtering modal article disables it', async ({page}) => {
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

	await expect(page.locator('div:not(.modal-content) > article').first()).toBeVisible();
	await expect(page.locator('div:not(.modal-content) > article button[title = "Expand article as modal"]').first()).toBeVisible();
	await page.locator('div:not(.modal-content) > article button[title = "Expand article as modal"]').first().click();
	await expect(page.locator('.modal.active article')).toHaveCount(1);

	await page.locator('.modal.active article button.articleButton[title = "Mark as read"]').first().click();
	await expect(page.locator('.modal.active article')).toHaveCount(0);
});