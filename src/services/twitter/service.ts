import TwitterArticle from './article'
import type {Service} from '../service'
import {registerService, STANDARD_ACTIONS} from '../service'
import {retweet, toggleFavorite} from './apiV1'

export const TwitterService: Service<TwitterArticle> = {
	name: 'Twitter',
	articles: {},
	endpointConstructors: [],
	userEndpoint: undefined,
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

/*interface TweetResponseV2 {
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
}*/
