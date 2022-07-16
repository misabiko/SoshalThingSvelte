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
				case 'singleTweet':
					const url = new URL("https://api.twitter.com/2/tweets/" + request.id);
					url.searchParams.set('tweet.fields', "id,created_at,entities,in_reply_to_user_id,referenced_tweets,text");
					url.searchParams.set('user.fields', "id,name,url,username,profile_image_url");
					url.searchParams.set('expansions', "author_id,attachments.media_keys,in_reply_to_user_id,referenced_tweets.id");

					console.log('Fetching ' + url.toString());
					//TODO Use got/browser alternative?
					fetch(url.toString(), {
						headers: {
							'Authorization': `Bearer ${twitter.bearer}`
						}
					})
						.then(response => response.json())
						.then(json => {
							console.dir(json);
							return json;
						})
						.then(response => sendResponse(response))
						.catch(err => {
							console.dir(err);
							sendResponse(err)
						})
					break;
				case 'fetchV1':
					fetch(request.url, {
						headers: twitterAuthHeaders(request.url, request.method),
						method: request.method,
						body: request.body,
					})
						.then(response => response.json())
						.then(json => {
							console.dir(json);
							return json;
						})
						.then(response => sendResponse(response))
						.catch(err => {
							console.dir(err);
							sendResponse(err)
						})
					break;
			}
		}
	}
);