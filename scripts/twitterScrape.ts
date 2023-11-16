import puppeteer, { Page } from 'puppeteer';
import { ServerWebSocket } from 'bun';

let twitterBearer: string | null = null;
let twitterCsrfToken: string | null = null;

const pages: {[endpoint: string]: Page} = {};

const browser = await puppeteer.launch({ headless: 'new' });
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

await login(page);

export type ClientData = {
	id: number,
	clientId: string | undefined
}

export async function onMessage(ws: ServerWebSocket<ClientData>, message: string, clients: {[id: number]: ServerWebSocket<ClientData>}) {
	console.log('websocket received: ', message);
	console.log('websocket data: ', ws.data);

	const json = JSON.parse(message);
	if (json.initService === true) {
		ws.data.clientId = 'TwitterService';
	} else if (json.initEndpoint !== undefined) {
		ws.data.clientId = json.initEndpoint;

		if (!Object.hasOwn(pages, json.initEndpoint)) {
			browser.newPage().then(page => {
				setupEndpoint(clients, page, json).catch(e => {
					//If the endpoint is removed before setup is done, we can ignore the error
					if (e.constructor.name == 'TargetCloseError') {
						console.warn('Endpoint closed before setup:', json.initEndpoint);
						return;
					}else
						throw e;
				});
			});
		}
	} else if (ws.data.clientId === 'TwitterService') {
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
	} else if (ws.data.clientId !== undefined) {
		switch (json.request) {
			case 'refresh':
				await page.click('a[soshal-id="timelineButton"]');
				break;
			case 'reload':
				await page.reload();
				break;
			case 'scrollDown':
				//@ts-ignore
				await page.evaluate(function () { window.scrollTo(0, document.body.scrollHeight); });
				break;
		}
	}
}

export async function onClose(ws: ServerWebSocket<ClientData>, clients: {[id: number]: ServerWebSocket<ClientData>}) {
	if (ws.data.clientId !== undefined && ws.data.clientId !== 'TwitterService') {
		console.log(`Closing ${ws.data.clientId} connection`);
		if ([...Object.values(clients)].find(c => c.data.clientId === ws.data.clientId) === undefined) {
			await pages[ws.data.clientId].close();
			delete pages[ws.data.clientId];
		}
	}
}

async function login(page: Page) {
	const cookiesPath = process.argv[2];

	if (cookiesPath === undefined || !Bun.file(cookiesPath).exists()) {
		console.log('No cookies, logging in');
	} else {
		const cookiesFile = Bun.file(cookiesPath);
		await page.setCookie(...await cookiesFile.json());
		console.log('Cookies loaded');

		await page.goto('https://twitter.com/');

		await page.waitForSelector('*[aria-label="Profile"]');
		const profileHref = await page.$eval('*[aria-label="Profile"]', el => el.href);
		if (profileHref == 'https://twitter.com/' + process.env.TWITTER_USERNAME) {
			console.log('Already logged in');
			return;
		}
	}

	await page.goto('https://twitter.com/i/flow/login');
	await page.waitForSelector('input[autocomplete="username"]');
	console.log('Waiting for login page');

	await page.type('input[autocomplete="username"]', process.env.TWITTER_USERNAME as string);

	const [nextHandler] = await page.$x("//span[contains(., 'Next')]");
	await nextHandler.click();

	await page.waitForSelector('input:not(:disabled)');
	await page.type('input:not(:disabled)', process.env.TWITTER_PASSWORD as string);

	const [loginHandler] = await page.$x("//span[contains(., 'Log in')]");
	await loginHandler.click();
	console.log('(Hopefully) logged in');

	await page.waitForFunction("window.location.pathname == '/home'");

	if (cookiesPath !== undefined) {
		const cookies = await page.cookies();
		await Bun.write(cookiesPath, JSON.stringify(cookies));
		console.log('Cookies saved to ' + cookiesPath);
	}
}

async function setupEndpoint(clients: {[id: number]: ServerWebSocket<ClientData>}, page: Page, { initEndpoint: endpoint, responseIncludes, gotoURL }) {
	pages[endpoint] = page;

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

			for (const client of Object.values(clients))
				if (client.data.clientId === endpoint && client.readyState === WebSocket.OPEN)
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

	if (timelineButton !== undefined)
		await findTimelineButton(page, timelineButton);
}

async function findTimelineButton(page: Page, timelineButton: string) {
	//If we click on the button too early, it won't change timeline
	await page.waitForSelector('article');

	for (const button of await page.$$('div[role="presentation"] > a[href="/home"]')) {
		const span = (await button.$eval('span', el => el.textContent));

		if (span === timelineButton) {
			await button.evaluate(el => {
				//avoiding id in case it messes up with the page
				el.setAttribute('soshal-id', 'timelineButton');
				el.click();
			});

			break;
		}
	}
}

async function likeTweet(page: Page, tweetId: string) {
	if (twitterBearer === null || twitterCsrfToken === null)
		throw new Error('Twitter bearer or csrf token not set');
	const response = await page.evaluate(twitterCommand, 'lI07N6Otwv1PhnEgXILM7A', 'FavoriteTweet', twitterBearer, twitterCsrfToken, tweetId);

	return {
		respondingTo: 'likeTweet',
		response: JSON.parse(response),
	};
}

async function unlikeTweet(page: Page, tweetId: string) {
	if (twitterBearer === null || twitterCsrfToken === null)
		throw new Error('Twitter bearer or csrf token not set');
	const response = await page.evaluate(twitterCommand, 'ZYKSe-w7KEslx3JhSIk5LA', 'UnfavoriteTweet', twitterBearer, twitterCsrfToken, tweetId);

	return {
		respondingTo: 'unlikeTweet',
		response: JSON.parse(response),
	};
}

async function retweetTweet(page: Page, tweetId: string) {
	if (twitterBearer === null || twitterCsrfToken === null)
		throw new Error('Twitter bearer or csrf token not set');
	const response = await page.evaluate(twitterCommand, 'ojPdsZsimiJrUGLR1sjUtA', 'CreateRetweet', twitterBearer, twitterCsrfToken, tweetId);

	return {
		respondingTo: 'retweetTweet',
		response: JSON.parse(response),
	};
}

async function twitterCommand(queryId: string, endpoint: string, bearer: string, csrfToken: string, tweetId: string) {
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