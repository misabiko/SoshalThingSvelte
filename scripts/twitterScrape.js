import puppeteer from 'puppeteer';
import dns from 'dns';

(async () => {
	// const browser = await puppeteer.launch({ headless: false });
	const browser = await puppeteer.connect({browserURL: 'http://127.0.0.1:9222'});
	const page = await browser.newPage();

	const session = await page.target().createCDPSession();
	await session.send('Network.enable');
	session.on('Network.responseReceived', async ({requestId, response}) => {
		if (!response.url.includes('/HomeTimeline'))
			return;
		const {body, base64Encoded} = await session.send('Network.getResponseBody', { requestId });
		console.log('Response received:', base64Encoded, body);
	});

	await page.goto('https://twitter.com/home');
})();