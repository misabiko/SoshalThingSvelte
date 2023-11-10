//TODO Remove and use metasoshal instead
//TODO Cleanup everything about Twitter's API

import {twitter} from '../../credentials.json';
import OAuth from 'oauth-1.0a';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';

const oauthClient = OAuth({
	consumer: {
		key: twitter.consumer_key,
		secret: twitter.consumer_secret,
	},
	signature_method: 'HMAC-SHA1',
	hash_function(baseString, key) {
		return Base64.stringify(hmacSHA1(baseString, key));
	},
});

function twitterAuthHeaders(url, method, token) {
	return oauthClient.toHeader(
		oauthClient.authorize({
			url,
			method,
		}, token)
	);
}

function twitterAccessAuthHeaders(url, method) {
	return twitterAuthHeaders(url, method, {
		key: twitter.access_key,
		secret: twitter.access_secret,
	});
}

let oauthToken;

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		if (!request.soshalthing)
			return;

		console.log('Extension received message');
		console.dir(request);

		if (request.request === 'extensionCheck')
			sendResponse({
				id: chrome.runtime.id,
				available: true,
				hasAccessToken: twitter?.access_key?.length > 0
			});
		else if (request.service === 'Twitter') {
			switch (request.request) {
				case 'fetchV1':
					fetch(request.url, {
						headers: twitterAccessAuthHeaders(request.url, request.method),
						method: request.method,
						body: request.body,
					})
						.then(response => response.json()
							.then(json => ({json, headers: [...response.headers.entries()]}))
						)
						.then(response => {
							console.dir(response);
							sendResponse(response);
						})
						.catch(err => {
							console.dir(err);
							sendResponse(err);
						});
					break;
				case 'oauth1.0aRequestToken': {
					const url = 'https://api.twitter.com/oauth/request_token?oauth_callback=oob';
					fetch(url, {
						headers: twitterAuthHeaders(url, 'POST'),
						method: 'POST'
					})
						.then(response => response.text()
							.then(text => ({
								json: Object.fromEntries(new URLSearchParams(text).entries()),
								headers: [...response.headers.entries()]
							}))
						)
						.then(response => {
							console.dir(response);
							oauthToken = response.json.oauth_token;
							sendResponse(response);
						})
						.catch(err => {
							console.dir(err);
							sendResponse(err);
						});
				} break;
				case 'oauth1.0aAccessToken': {
					const url = `https://api.twitter.com/oauth/access_token?oauth_token=${oauthToken}&oauth_verifier=${request?.body.oauthVerifier}`;
					fetch(url, {
						headers: twitterAuthHeaders(url, 'POST'),
						method: 'POST'
					})
						.then(response => response.text())
						.then(text => Object.fromEntries(new URLSearchParams(text).entries()))
						.then(response => {
							console.dir(response);
							twitter.access_key = response.oauth_token;
							twitter.access_secret = response.oauth_token_secret;
							sendResponse({json: {soshalthing: true}, headers: {}});
						})
						.catch(err => {
							console.dir(err);
							sendResponse(err);
						});
				} break;
			}
		}
	}
);