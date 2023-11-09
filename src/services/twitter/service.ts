import TwitterArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import {STANDARD_ACTIONS} from '../actions';
import Article, {type ArticleWithRefs, getRootArticle} from '../../articles';
import type {Filter} from '../../filters';
import { retweet, toggleLike } from './pageAPI';

//TODO Add service initialization point?
export const TwitterService: Service<TwitterArticle> = {
	...newService('Twitter'),
	articleActions: {
		[STANDARD_ACTIONS.like.key]: {
			...STANDARD_ACTIONS.like,
			action: toggleLike,
			actionned(article) { return article.liked; },
			disabled(article) { return article.deleted; },
			count(article) { return article.likeCount; },
		},
		[STANDARD_ACTIONS.repost.key]: {
			...STANDARD_ACTIONS.repost,
			togglable: false,
			action: retweet,
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