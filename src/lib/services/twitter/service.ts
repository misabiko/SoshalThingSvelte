import type {Id} from './article'
import TwitterArticle from './article'
import type {Service} from '../service'
import {addArticles, getMarkedAsReadStorage, registerService} from '../service'

export const TwitterService: Service = {
	name: 'Twitter',
	articles: {},
	articleActions: {},
}
TwitterArticle.service = TwitterService.name

registerService(TwitterService)

export async function getTweet(id: Id) {
	console.log("Fetching " + id)
	try {
		const response: TweetResponseV2 = await new Promise((resolve, reject) => {
			const timeout = 5000
			const timeoutId = setTimeout(() => reject(new Error(`Extension didn't respond in ${timeout} ms.`)), timeout)

			//TODO Cancel request on timeout
			//TODO Add setting or detect extension id
			chrome.runtime.sendMessage("nlbklcaopkjjncgjikklggigffbjfloe", {
				soshalthing: true,
				service: TwitterService.name,
				request: 'singleTweet',
				id,
			}, response => {
				clearTimeout(timeoutId)
				console.log('Response!')
				resolve(response)
			})
		})

		console.dir(response)
		if ('data' in (response as object)) {
			const [idPair] = addArticles(TwitterService, new TwitterArticle(
				response.data.id,
				response.data.text,
				{
					id: response.includes.users[0].id,
					name: response.includes.users[0].name,
					username: response.includes.users[0].username,
					url: "https://twitter.com/" + response.includes.users[0].username,
					avatarUrl: response.includes.users[0].profile_image_url,
				},
				new Date(response.data.created_at),
				getMarkedAsReadStorage(TwitterService) as string[],
			))

			return idPair
		}else {
			console.error('Error fetching single tweet', response)
			return undefined
		}
	}catch (errorResponse) {
		console.error('Error fetching single tweet', errorResponse)
	}
}

interface TweetResponseV2 {
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