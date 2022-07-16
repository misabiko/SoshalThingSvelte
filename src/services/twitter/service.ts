import type {ArticleIdPair} from '../article'
import TwitterArticle from './article'
import type {Service} from '../service'
import {getWritable, registerService, STANDARD_ACTIONS} from '../service'
import {get} from 'svelte/store'
import type {TweetResponse} from './endpoints'
import {getV1APIURL} from './endpoints'
import {fetchExtension} from '../extension'

export const TwitterService: Service = {
	name: 'Twitter',
	articles: {},
	articleActions: {
		[STANDARD_ACTIONS.like]: {
			action: toggleFavorite,
			togglable: true,
		},
		[STANDARD_ACTIONS.repost]: {
			action: retweet,
			togglable: false,
		},
	},
}
TwitterArticle.service = TwitterService.name

registerService(TwitterService)

async function toggleFavorite(idPair: ArticleIdPair) {
	const writable = getWritable(idPair);
	const action = (get(writable) as TwitterArticle).liked ? 'destroy' : 'create';

	try {
		const response = await fetchExtensionV1(
			`${getV1APIURL('favorites/' + action)}?id=${idPair.id}`,
			'POST'
		);

		writable.update(a => {
			(a as TwitterArticle).liked = response.favorited || false
			return a
		})
	}catch (cause: V1ErrorResponse | any) {
		let shouldThrow = true
		if (cause.errors !== undefined && (cause as V1ErrorResponse).errors.some(e => e.code === 139)) {
			console.warn(cause)
			writable.update(a => {
				(a as TwitterArticle).liked = true
				return a
			})

			if (cause.errors.length === 1)
				shouldThrow = false
		}

		if (shouldThrow)
			throw new Error(JSON.stringify(cause, null, '\t'))
	}
}

async function retweet(idPair: ArticleIdPair) {
	const writable = TwitterService.articles[idPair.id as string];
	if ((get(writable) as TwitterArticle).retweeted)
		return

	const response = await fetchExtensionV1(
		`${getV1APIURL('statuses/retweet')}?id=${idPair.id}`,
		'POST'
	);

	writable.update(a => {
		(a as TwitterArticle).retweeted = response.retweeted || false
		return a
	})
}

export async function fetchExtensionV1<T = TweetResponse>(url: string, method = 'GET', body?: any): Promise<T> {
	const response = await fetchExtension<T | V1ErrorResponse>(
		TwitterService.name,
		'fetchV1',
		url,
		method,
		body
	)

	if ((response as V1ErrorResponse).errors !== undefined)
		return Promise.reject(response)

	return response as T
}

type V1ErrorResponse = {
	errors: {
		code: number,
		message: string,
	}[]
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