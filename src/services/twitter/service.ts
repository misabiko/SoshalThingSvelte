import TwitterArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import {STANDARD_ACTIONS} from '../actions';
import Article, {type ArticleWithRefs, getRootArticle} from '../../articles';
import type {Filter} from '../../filters';
import { retweetPage, retweetWebSocket, toggleLikePage, toggleLikeWebSocket } from './pageAPI';

export const isOnTwitter = window.location.hostname === 'twitter.com';

export const TwitterService: Service<TwitterArticle> = {
	...newService('Twitter'),
	articleActions: {
		[STANDARD_ACTIONS.like.key]: {
			...STANDARD_ACTIONS.like,
			//TODO Disable actions when not on twitter and websocket is disabled, but also don't parse localstorage for every article
			action: isOnTwitter ? toggleLikePage : toggleLikeWebSocket,
			actionned(article) { return article.liked; },
			disabled(article) { return article.deleted; },
			count(article) { return article.likeCount; },
		},
		[STANDARD_ACTIONS.repost.key]: {
			...STANDARD_ACTIONS.repost,
			togglable: false,
			action: isOnTwitter ? retweetPage : retweetWebSocket,
			actionned(article) { return article.retweeted; },
			disabled(article) { return article.deleted; },
			count(article) { return article.retweetCount; },
		},
	},
	keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
		if ((getRootArticle(articleWithRefs).constructor as typeof Article).service !== 'Twitter')
			return true;

		switch (filter.type) {
			case 'notDeleted':
				return !(getRootArticle(articleWithRefs) as TwitterArticle).deleted;
			default:
				return true;
		}
	}
};
TwitterArticle.service = TwitterService.name;

registerService(TwitterService);