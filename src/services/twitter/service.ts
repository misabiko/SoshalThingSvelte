import TwitterArticle from './article'
import type {Service} from '../service'
import {newService, registerService} from '../service'
import {retweet, toggleFavorite} from './apiV1'
import {STANDARD_ACTIONS} from '../actions'

export const TwitterService: Service<TwitterArticle> = {
	...newService('Twitter'),
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

//TODO Add Deleted filter to Twitter