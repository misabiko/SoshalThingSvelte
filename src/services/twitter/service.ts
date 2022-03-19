import type {Readable} from 'svelte/store'
import type {Id} from './article'
import {readable} from 'svelte/store'
import TwitterArticle from './article';

export const articles: Readable<TwitterArticle>[] = [];

export const serviceName = 'Twitter';

export async function getTweet(id: Id) {
	console.log("Fetching " + id);
	try {
		const response: TweetResponse = await new Promise((resolve, reject) => {
			const timeout = 5000;
			const timeoutId = setTimeout(() => reject(new Error(`Extension didn't respond in ${timeout} ms.`)), timeout);

			//TODO Cancel request on timeout
			//TODO Add setting or detect extension id
			chrome.runtime.sendMessage("nlbklcaopkjjncgjikklggigffbjfloe", {
				soshalthing: true,
				service: serviceName,
				request: 'singleTweet',
				id,
			}, response => {
				clearTimeout(timeoutId);
				console.log('Response!');
				resolve(response);
			});
		});

		console.dir(response);
		if ('data' in (response as object)) {
			articles.push(readable(new TwitterArticle(response.data.id, response.data.text, {
				id: response.includes.users[0].id,
				name: response.includes.users[0].name,
				username: response.includes.users[0].username,
				url: "https://twitter.com/" + response.includes.users[0].username,
				avatarUrl: response.includes.users[0].profile_image_url,
			}, new Date(response.data.created_at))))
			return articles.at(-1);
		}else {
			console.error('Error fetching single tweet', response)
			return undefined
		}
	}catch (errorResponse) {
		console.error('Error fetching single tweet', errorResponse);
	}
}

interface TweetResponse {
	data: {
		id: string;
		text: string;
		author_id: string;
		created_at: string;
		attachments: {
			media_keys: string[]
		}
		entities: {
			urls: {
				display_url: string;
				end: number;
				expanded_url: string;
				start: number;
				url: string;
			}[]
		}
	};
	includes: {
		media: {
			media_key: string;
			type: string;
		}[];
		users: {
			id: string;
			name: string;
			url: string;
			username: string;
			profile_image_url: string;
		}[]
	};
}