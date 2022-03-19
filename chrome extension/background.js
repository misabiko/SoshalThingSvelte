chrome.action.onClicked.addListener((tab) => {
	console.log("onClicked!");
	fetch("https://api.twitter.com/2/tweets/1485090838539653121")
		.then(response => response.text())
		.then(responseText => console.log("Response:\n" + responseText))
		.catch(err => console.error(err))

	/*const client = new Twitter({
		subdomain: "api", // "api" is the default (change for other subdomains)
		version: "1.1", // version "1.1" is the default (change for other subdomains)
		consumer_key: "jAupXjMR7AHow9HqGQqj3RWG7", // from Twitter.
		consumer_secret: "Pll92CtOpMl4Oo8wb7yNxUIbyYs0XVjRwjDglKzTXO0sXHwgEC", // from Twitter.
		//access_token_key: "uvw", // from your User (oauth_token)
		//access_token_secret: "xyz" // from your User (oauth_token_secret)
	});

	client
		.get("account/verify_credentials")
		.then(results => {
			console.log("results", results);
		})
		.catch(console.error);*/
});

chrome.runtime.onMessageExternal.addListener(
	function(request, sender, sendResponse) {
		console.log("Extension received message");
		console.dir(request);
	}
);