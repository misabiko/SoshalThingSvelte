import puppeteer from 'puppeteer';
import clipboardy from 'clipboardy';
import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 443 });

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
		//clipboardy.writeSync(body);
		for (const client of wss.clients)
			if (client.readyState === WebSocket.OPEN)
				client.send(body);
	});

	openUserPage(page);

	wss.on('connection', function connection(ws) {
		ws.on('error', console.error);

		console.log('New connection');
	});
})();

async function openUserPage(page) {
	await page.goto('https://twitter.com/i/flow/login');
	console.log('Waiting for login page');
	await page.waitForSelector('input[autocomplete="username"]');
	await page.type('input[autocomplete="username"]', process.env.TWITTER_USERNAME);

	const [nextHandler] = await page.$x("//span[contains(., 'Next')]");
	await nextHandler.click();

	await page.waitForSelector('input:not(:disabled)');
	await page.type('input:not(:disabled)', process.env.TWITTER_PASSWORD);

	const [loginHandler] = await page.$x("//span[contains(., 'Log in')]");
	await loginHandler.click();
	console.log('(Hopefully) logged in');

	await page.waitForFunction("window.location.pathname == '/home'");
	await page.goto('https://twitter.com/' + process.env.TWITTER_USERNAME);
}