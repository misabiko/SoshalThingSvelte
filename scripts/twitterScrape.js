import puppeteer from 'puppeteer';
import clipboardy from 'clipboardy';

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	// const browser = await puppeteer.connect({browserURL: 'http://127.0.0.1:9222'});
	const page = await browser.newPage();

	const session = await page.target().createCDPSession();
	await session.send('Network.enable');
	session.on('Network.responseReceived', async ({ requestId, response }) => {
		if (!response.url.includes('/UserTweets'))
			return;
		const { body, base64Encoded } = await session.send('Network.getResponseBody', { requestId });
		console.log('Response received:', base64Encoded/* , body */);
		clipboardy.writeSync(body);
	});

	await page.goto('https://twitter.com/i/flow/login');
	await page.waitForSelector('input[autocomplete="username"]');
	await page.type('input[autocomplete="username"]', process.env.TWITTER_USERNAME);

	const [nextHandler] = await page.$x("//span[contains(., 'Next')]");
	if (nextHandler) {
		await nextHandler.click();
	}

	await page.waitForSelector('input:not(:disabled)');
	await page.type('input:not(:disabled)', process.env.TWITTER_PASSWORD);

	const [loginHandler] = await page.$x("//span[contains(., 'Log in')]");
	if (loginHandler) {
		await loginHandler.click();
	}

	await page.waitForFunction("window.location.pathname == '/home'");
	await page.goto('https://twitter.com/' + process.env.TWITTER_USERNAME);
})();