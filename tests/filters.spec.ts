import {expect, test} from '@playwright/test'
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from './storages.spec.js'

test.beforeEach(async ({page}) => {
	await loadWithLocalStorage(page, {
		[TIMELINE_STORAGE_KEY]: [{
			endpoints: [
				{
					service: 'Dummy',
					endpointType: 0,
				}
			],
			filters: [
				{
					filter: {type: "notMarkedAsRead"},
					enabled: true,
					inverted: false,
				}, {
					filter: {type: "notHidden"},
					enabled: true,
					inverted: false,
				},
			]
		}]
	})
})

test('mark as read', async ({page}) => {
	const articleLocator = page.locator('article')
	const articleCount = await articleLocator.count()
	expect(articleCount).toBeGreaterThan(0)

	await page.locator('article button.articleButton[title = "Mark as read"]').first().click();

	await expect(articleLocator).toHaveCount(articleCount - 1);
})

test('hidden', async ({page}) => {
	const articleLocator = page.locator('article')
	const articleCount = await articleLocator.count()
	expect(articleCount).toBeGreaterThan(0)

	await page.locator('article .dropdown-trigger button.articleButton').first().click();

	await page.locator('article a.dropdown-item >> text=Hide').first().click();

	await expect(articleLocator).toHaveCount(articleCount - 1);
})

test.skip('repost by username', async () => {})

test.skip('quote by username', async () => {})