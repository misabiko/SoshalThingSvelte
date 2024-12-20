import {expect, test, type ConsoleMessage} from '@playwright/test';
import {loadWithLocalStorage, MAIN_STORAGE_KEY, TIMELINE_STORAGE_KEY} from '../storagesUtils';

//TODO Port to before each test
test('no errors or warnings on boot', async ({page}) => {
	const messages = {
		errors: [] as ConsoleMessage[],
		warnings: [] as ConsoleMessage[],
		misc: [] as ConsoleMessage[],
	};

	page.on('console', msg => {
		if (msg.type() === 'error') {
			// console.error(msg.text());
			messages.errors.push(msg);
		}else if (msg.type() === 'warning') {
			// console.warn(msg.text());
			messages.warnings.push(msg);
		}else
			messages.misc.push(msg);
	});
	await page.goto('/');

	expect(messages.errors).toHaveLength(0);
	expect(messages.warnings).toHaveLength(0);
});

test.describe('fullscreen timeline', () => {
	test.describe('via search param', () => {
		test('empty param', async ({page}) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: {t1: {}, t2: {}, t3: {}},
			});
			await page.goto('/?fullscreen_timeline');

			const timeline = page.locator('.timeline');
			await expect(timeline).toHaveCount(1);
			await expect(timeline).toHaveClass(/fullscreenTimeline/);
		});

		test('true', async ({page}) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: {t1: {}, t2: {}, t3: {}},
			});
			await page.goto('/?fullscreen_timeline=true');

			const timeline = page.locator('.timeline');
			await expect(timeline).toHaveCount(1);
			await expect(timeline).toHaveClass(/fullscreenTimeline/);
		});

		test('num', async ({page}) => {
			await loadWithLocalStorage(page, {
				[TIMELINE_STORAGE_KEY]: {t1: {}, t2: {}, t3: {}},
			});
			await page.goto('/?fullscreen_timeline=1');

			const timeline = page.locator('.timeline');
			await expect(timeline).toHaveCount(1);
			await expect(timeline).toHaveClass(/fullscreenTimeline/);
		});
	});

	test('setting timeline fullscreen retains order', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {
				Timeline1: {title: 'Timeline1'},
				Timeline2: {title: 'Timeline2'},
				Timeline3: {title: 'Timeline3'},
			},
		});

		await page.click('.timeline:nth-child(2) .timelineHeader button[title = "Make timeline fullscreen"]');

		await page.click('.timelineHeader button[title = "Disable fullscreen"]');

		for (let i = 1; i <= 3; ++i)
			await expect(page.locator(`.timeline:nth-child(${i}) .timelineLeftHeader > strong`))
				.toHaveText('Timeline' + i, {timeout: 500});
	});

	test('removing main timeline retains order', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {
				Timeline1: {title: 'Timeline1'},
				Timeline2: {title: 'Timeline2'},
				Timeline3: {title: 'Timeline3'},
			},
		});

		await page.click('.timeline:nth-child(2) .timelineHeader button[title = "Make timeline fullscreen"]');

		await page.click('.timelineHeader button[title = "Expand options"]');

		await page.click('text=Remove timeline');

		await expect(page.locator('.timeline:nth-child(1) .timelineLeftHeader > strong'))
			.toHaveText('Timeline1', {timeout: 500});
		await expect(page.locator('.timeline:nth-child(2) .timelineLeftHeader > strong'))
			.toHaveText('Timeline3', {timeout: 500});
	});
});

test.describe('timeline views', () => {
	test('via search param', async ({page}) => {
		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {
				'Timeline 1': {title: 'Timeline 1'},
				'Timeline 2': {title: 'Timeline 2'},
				'Timeline 3': {title: 'Timeline 3'},
			},
			[MAIN_STORAGE_KEY]: {
				timelineViews: {
					myView: {
						timelineIds: ['Timeline 1', 'Timeline 3'],
					},
				},
			},
		});
		await page.goto('/?view=myView');

		const timeline = page.locator('.timeline');
		await expect(timeline).toHaveCount(2);
		await expect(timeline.nth(0).locator('.timelineLeftHeader strong')).toHaveText('Timeline 1');
		await expect(timeline.nth(1).locator('.timelineLeftHeader strong')).toHaveText('Timeline 3');
	});
});

test.describe('autoscroll', () => {
	test.beforeEach(async ({page}) => {
		await page.setViewportSize({width: 800, height: 600});

		await loadWithLocalStorage(page, {
			[TIMELINE_STORAGE_KEY]: {t1: {
				endpoints: [
					{
						service: 'Dummy',
						endpointType: 'DummyEndpoint',
					},
				],
			}},
		});

		const container = page.locator('.articlesContainer').first();

		//Making sure we have room to scroll
		const box = await container.boundingBox();
		if (box === null)
			throw new Error('No bounding box');
		expect((await container.evaluate(c => c.scrollHeight) - box.height), 'should have at least 500 height before doing scroll tests').toBeGreaterThan(500);
	});

	test('scroll bounces from top', async ({page}) => {
		const container = page.locator('.articlesContainer').first();

		const scrollTop = await container.evaluate(c => c.scrollTop = 10);

		await page.dblclick('button[title="Autoscroll"]');

		await page.waitForTimeout(500);

		expect(await container.evaluate(c => c.scrollTop)).toBeGreaterThan(scrollTop);
	});

	test('scroll bounces from bottom', async ({page}) => {
		const container = page.locator('.articlesContainer').first();

		const scrollTop = await container.evaluate(c => c.scrollTop = c.scrollHeight - 10);

		await page.click('button[title="Autoscroll"]');

		await page.waitForTimeout(500);

		expect(await container.evaluate(c => c.scrollTop)).toBeLessThan(scrollTop);
	});

	test('scroll downward by default', async ({page}) => {
		const container = page.locator('.articlesContainer').first();

		//Scrolling halfway, so it doesn't bounce from top on first frame
		const scrollTop = await container.evaluate(c => c.scrollTop = (c.scrollHeight - c.clientHeight) / 2);

		await page.click('button[title="Autoscroll"]');

		await page.waitForTimeout(500);

		expect(await container.evaluate(c => c.scrollTop)).toBeGreaterThan(scrollTop);
	});

	test('scroll flips every click', async ({page}) => {
		const container = page.locator('.articlesContainer').first();

		//Scrolling halfway so, it doesn't bounce from top on first frame
		const scrollTop = await container.evaluate(c => c.scrollTop = (c.scrollHeight - c.clientHeight) / 2);

		await page.dblclick('button[title="Autoscroll"]');

		await page.waitForTimeout(500);

		expect(await container.evaluate(c => c.scrollTop)).toBeLessThan(scrollTop);
	});
});