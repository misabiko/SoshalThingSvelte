//TODO Port to typescript

import puppeteer from 'puppeteer';
import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const wss = new WebSocketServer({ port: 443 });

let twitterBearer = null;
let twitterCsrfToken = null;

const pages = {};

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	// const browser = await puppeteer.connect({browserURL: 'http://127.0.0.1:9222'});
	const page = await browser.newPage();
	const session = await page.target().createCDPSession();
	await session.send('Network.enable');
	session.on('Network.requestWillBeSent', async ({ requestId, request }) => {
		if (!request.url.includes('graphql'))
			return;

		console.log('Request received:',
			'\n\tid: ', requestId,
			'\n\turl: ', request.url,
		);

		if (twitterBearer === null || twitterCsrfToken === null) {
			twitterBearer = request.headers['authorization'].split(' ')[1];
			twitterCsrfToken = request.headers['x-csrf-token'];

			await session.send('Network.disable');
			await session.detach();
		}
	});

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

		//TODO If we keep using multiple clients, remove this listener init
		ws.on('message', (data) => {
			console.log('websocket received: %s', JSON.parse(data));

			const json = JSON.parse(data);
			if (json.initService === true) {
				ws.on('message', async (data) => {
					const json = JSON.parse(data);
					switch (json.request) {
						case 'likeTweet':
							ws.send(JSON.stringify(await likeTweet(page, json.body)));
							break;
						case 'unlikeTweet':
							ws.send(JSON.stringify(await unlikeTweet(page, json.body)));
							break;
						case 'retweetTweet':
							ws.send(JSON.stringify(await retweetTweet(page, json.body)));
							break;
					}
				});
			} else if (json.initEndpoint !== undefined) {
				ws.clientId = json.initEndpoint;
				const page = Object.hasOwn(pages, json.initEndpoint) ? Promise.resolve(pages[json.initEndpoint]) : browser.newPage();

				page
					.then(page => {
						pages[json.initEndpoint] = page;

						setupEndpoint(page, json).catch(e => {
							//If the endpoint is removed before setup is done, we can ignore the error
							if (e.constructor.name == 'TargetCloseError') {
								console.warn('Endpoint closed before setup:', json.initEndpoint);
								return;
							}else
								throw e;
						});

						ws.on('message', async (data) => {
							const json = JSON.parse(data);
							switch (json.request) {
								case 'reload':
									await page.reload();
									break;
								case 'scrollDown':
									// eslint-disable-next-line no-undef
									await page.evaluate(function() {window.scrollTo(0, document.body.scrollHeight);});
									break;
							}
						});
					});
				ws.on('close', async () => {
					console.log(`Closing ${ws.clientId} connection`);
					if ([...wss.clients].find(c => c.clientId === ws.clientId) === undefined) {
						await pages[ws.clientId].close();
						delete pages[ws.clientId];
					}
				});
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
async function setupEndpoint(page, { initEndpoint: endpoint, responseIncludes, gotoURL }) {
	//TODO try setting target on browser
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
		} catch (e) {
			if (e.constructor.name === 'ProtocolError')
				console.error('Protocol error for response:', response, e);
			else
				throw e;
		}
	});

	await page.goto(gotoURL);

	const timelineButton = ({
		'/HomeTimeline': 'For you',
		'/HomeLatestTimeline': 'Following',
	})[responseIncludes];

	if (timelineButton !== undefined) {
		//If we click on the button too early, it won't change timeline
		await page.waitForSelector('article');

		for (const button of await page.$$('div[role="presentation"] > a[href="/home"]')) {
			const span = (await button.$eval('span', el => el.textContent));

			if (span === timelineButton) {
				await button.evaluate(el => el.click());
				//TODO Cache the button to use for refreshing
				break;
			}
		}
	}
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} tweetId
 */
async function likeTweet(page, tweetId) {
	const response = await page.evaluate(twitterCommand, 'lI07N6Otwv1PhnEgXILM7A', 'FavoriteTweet', twitterBearer, twitterCsrfToken, tweetId);

	return {
		respondingTo: 'likeTweet',
		response: JSON.parse(response),
	};
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} tweetId
 */
async function unlikeTweet(page, tweetId) {
	const response = await page.evaluate(twitterCommand, 'ZYKSe-w7KEslx3JhSIk5LA', 'UnfavoriteTweet', twitterBearer, twitterCsrfToken, tweetId);

	return {
		respondingTo: 'unlikeTweet',
		response: JSON.parse(response),
	};
}

/**
 * @param {import('puppeteer').Page} page
 * @param {string} tweetId
 */
async function retweetTweet(page, tweetId) {
	const response = await page.evaluate(twitterCommand, 'ojPdsZsimiJrUGLR1sjUtA', 'CreateRetweet', twitterBearer, twitterCsrfToken, tweetId);

	return {
		respondingTo: 'retweetTweet',
		response: JSON.parse(response),
	};
}

/**
 * @param {string} queryId
 * @param {string} endpoint
 * @param {string} bearer
 * @param {string} csrfToken
 * @param {string} tweet_id
 */
async function twitterCommand(queryId, endpoint, bearer, csrfToken, tweetId) {
	try {
		const response = await fetch(`https://twitter.com/i/api/graphql/${queryId}/${endpoint}`, {
			method: 'POST',

			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + bearer,
				'X-Csrf-Token': csrfToken,
			},

			body: JSON.stringify({
				queryId,
				variables: {
					tweet_id: tweetId,
				}
			})
		});
		const responseText = await response.text();

		// console.log(endpoint + ' response: ', responseText);
		return responseText;
	} catch (e) {
		console.error(endpoint + ' error:', e);
		return e;
	}
}