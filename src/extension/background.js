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

function twitterAuthHeaders(url, method) {
	return oauthClient.toHeader(
		oauthClient.authorize({
			url,
			method,
		}, {
			key: twitter.access_key,
			secret: twitter.access_secret,
		})
	)
}

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		if (!request.soshalthing)
			return;

		console.log("Extension received message");
		console.dir(request);

		if (request.request === 'extensionCheck')
			sendResponse({id: chrome.runtime.id, available: true})
		else if (request.service === 'Twitter') {
			switch (request.request) {
				case 'fetchV1':
					fetch(request.url, {
						headers: twitterAuthHeaders(request.url, request.method),
						method: request.method,
						body: request.body,
					})
						.then(response => response.json()
							.then(json => ({json, headers: [...response.headers.entries()]}))
						)
						.then(response => {
							console.dir(response);
							sendResponse(response)
						})
						.catch(err => {
							console.dir(err);
							sendResponse(err)
						})
					break;
			}
		}
	}
);