import TwitterArticle from './article'
import type {Service} from '../service'
import {newService, registerService} from '../service'
import {retweet, toggleFavorite} from './apiV1'
import {STANDARD_ACTIONS} from '../actions'
import Article, {type ArticleWithRefs, getRootArticle} from '../../articles'
import type {Filter} from '../../filters'

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
	keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
		if ((getRootArticle(articleWithRefs).constructor as typeof Article).service !== 'Twitter')
			return true

		switch (filter.type) {
			case 'notDeleted':
				return !(getRootArticle(articleWithRefs) as TwitterArticle).deleted
			default:
				return true
		}
	}
}
TwitterArticle.service = TwitterService.name

registerService(TwitterService)