import puppeteer from 'puppeteer';
import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const wss = new WebSocketServer({ port: 443 });

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	// const browser = await puppeteer.connect({browserURL: 'http://127.0.0.1:9222'});
	const page = await browser.newPage();

	//TODO Move cookie stuff to login()
	const cookiesPath = process.argv[2];

	if (cookiesPath === undefined || !existsSync(cookiesPath)) {
		console.log('No cookies, logging in');
		await login(page, cookiesPath);
	} else {
		await page.setCookie(...JSON.parse(await fs.readFile(cookiesPath)));
		console.log('Cookies loaded');

		await page.goto('https://twitter.com/');

		await page.waitForSelector('*[aria-label="Profile"]');
		const profileHref = await page.$eval('*[aria-label="Profile"]', el => el.href);
		if (profileHref == 'https://twitter.com/' + process.env.TWITTER_USERNAME)
			console.log('Already logged in');
		else
			await login(page, cookiesPath);
	}

	wss.on('connection', (ws) => {
		ws.on('websocket error', console.error);

		ws.on('message', (data) => {
			console.log('websocket received: %s', JSON.parse(data));

			const json = JSON.parse(data);
			if (json.initEndpoint !== undefined) {
				//TODO Reuse client if already exists
				ws.clientId = json.initEndpoint;
				browser.newPage()
				.then(page => setupEndpoint(
					page,
					// TODO probably just pass the json
					json.initEndpoint,
					json.responseIncludes,
					json.gotoURL ?? ('https://twitter.com/' + process.env.TWITTER_USERNAME)
				));
			}
		});

		console.log('New websocket connection');
	});
})();

/**
 * @param {import('puppeteer').Page} page
 * @param {string | undefined} cookiesPath
 */
async function login(page, cookiesPath) {
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

	if (cookiesPath !== undefined) {
		const cookies = await page.cookies();
		await fs.writeFile(cookiesPath, JSON.stringify(cookies));
		console.log('Cookies saved to ' + cookiesPath);
	}
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} endpoint
 * @param {string} responseIncludes
 * @param {string} gotoURL
 */
async function setupEndpoint(page, endpoint, responseIncludes, gotoURL) {
	const session = await page.target().createCDPSession();
	await session.send('Network.enable');
	session.on('Network.responseReceived', async ({ requestId, response }) => {
		if (!response.url.includes(responseIncludes))
			return;

		console.log('Response received:',
			'\n\tendpoint: ', endpoint,
			'\n\tid: ', requestId,
			'\n\tstatus: ', response.status
		);

		try {
			const { body } = await session.send('Network.getResponseBody', { requestId });

			for (const client of wss.clients)
				if (client.clientId === endpoint && client.readyState === WebSocket.OPEN)
					client.send(body);
		}catch (e) {
			if (e.constructor.name === 'ProtocolError')
				console.error('Protocol error for response:', response, e);
			else
				throw e;
		}
	});

	await page.goto(gotoURL);
}