import { expect, test } from '@playwright/test';
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from './storages.spec.js'

test.describe('fullscreen timeline', () => {
	test('via search param', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{}]
		})
		await page.goto('/?fullscreen_timeline=true');

		await expect(page.locator('.timeline').first()).toHaveClass(/fullscreenTimeline/);
	});

	test('setting timeline fullscreen retains order', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{}, {}, {}]
		})

		await page.click('.timeline:nth-child(2) .timelineHeader button[title = "Make timeline fullscreen"]');

		await page.click('.timelineHeader button[title = "Disable fullscreen"]');

		for (let i = 1; i <= 3; ++i)
			await expect(page.locator(`.timeline:nth-child(${i}) .timelineLeftHeader > strong`))
				.toHaveText('Timeline' + i, {timeout: 500});
	});

	test('removing main timeline retains order', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [
				{title: 'Timeline1'},
				{title: 'Timeline2'},
				{title: 'Timeline3'},
			]
		})

		await page.click('.timeline:nth-child(2) .timelineHeader button[title = "Make timeline fullscreen"]');

		await page.click('.timeline:nth-child(2) .timelineHeader button[title = "Expand options"]');

		await page.click('text=Remove timeline');

		await page.click('.timelineHeader button[title = "Disable fullscreen"]');

		await expect(page.locator('.timeline:nth-child(1) .timelineLeftHeader > strong'))
			.toHaveText('Timeline1', {timeout: 500});
		await expect(page.locator('.timeline:nth-child(2) .timelineLeftHeader > strong'))
			.toHaveText('Timeline3', {timeout: 500});
	});
});

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

		await page.click('article .likeButton');

		await expect(page.locator('article .likeButton')).toHaveClass(/likedPostButton/);
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

		await page.click('article .repostButton');

		await expect(page.locator('article .repostButton')).toHaveClass(/repostedPostButton/);
	});
})