import test, {expect} from "@playwright/test"
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from './storages.spec'

test.describe('SocialArticleView', () => {
	test('like feedback', async ({page}) => {
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

		await page.locator('article .likeButton').first().click();

		await expect(page.locator('article .likeButton').first()).toHaveClass(/likedPostButton/);
	});

	test('repost feedback', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{
				title: "Timeline",
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 0,
					}
				]
			}]
		})

		await page.locator('article .repostButton').first().click();

		await expect(page.locator('article .repostButton').first()).toHaveClass(/repostedPostButton/);
	});
})