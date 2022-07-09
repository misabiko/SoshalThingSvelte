import { expect, test } from '@playwright/test';
import {loadWithLocalStorage, TIMELINE_STORAGE_KEY} from './storages.spec.js'
//TODO Move tests to meta repo

test('timeline without endpoint', async ({page}) => {
	await loadWithLocalStorage(page, {
		[TIMELINE_STORAGE_KEY]: [{}]
	})

	await expect(page.locator('.timeline')).toHaveCount(1);

	await page.click("#sidebarButtons button[title = 'Expand sidebar']");

	await expect(page.locator("#sidebar > .sidebarMenu > div.box").nth(2)).toBeEmpty();
});

test.describe('fullscreen timeline', () => {
	test('via search param', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{}]
		})
		await page.goto('/?fullscreen_timeline=true');

		await expect(page.locator('.timeline').first()).toHaveClass(/mainTimeline/);
	});

	test('setting timeline fullscreen retains order', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{}, {}, {}]
		})

		await page.click('.timeline:nth-child(2) .timelineHeader .timelineButtons button[title = "Expand options"]');

		await page.click('button:has-text("Set as main timeline")');

		await page.click('#sidebarButtons button[title = "Multiple Timelines"]');

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

		await page.click('.timeline:nth-child(2) .timelineHeader .timelineButtons button[title = "Expand options"]');

		await page.click('button:has-text("Set as main timeline")');

		await page.click('text=Remove timeline');

		await page.click('#sidebarButtons button[title = "Multiple Timelines"]');

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
						"service": "Dummy",
						"endpoint_type": 0,
						"params": {},
						"on_start": true,
						"on_refresh": true
					}
				]
			}]
		})

		await page.click('.article .likeButton');

		await expect(page.locator('.article .likeButton')).toHaveClass(/likedPostButton/);
	});

	test('repost feedback', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: [{
				title: "Timeline",
				endpoints: [
					{
						"service": "Dummy",
						"endpoint_type": 0,
						"params": {},
						"on_start": true,
						"on_refresh": true
					}
				]
			}]
		})

		await page.click('.article .repostButton');

		await expect(page.locator('.article .repostButton')).toHaveClass(/repostedPostButton/);
	});
})