import {twitter} from '../../credentials.json';

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		if (!request.soshalthing)
			return;

		console.log("Extension received message");
		console.dir(request);

		if (request.service === 'Twitter') {
			if (request.request === 'singleTweet') {
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
			}
		}
	}
);