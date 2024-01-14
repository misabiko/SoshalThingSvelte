import {FetchType, newService, registerService, type Service} from '../../service';
import TwitterNotificationArticle, {NotificationType} from './article';
import {twitterFetch} from '../service';
import {writable} from 'svelte/store';
import {type ArticleWithRefs, getRootArticle} from '~/articles';
import type {Filter} from '~/filters';

export const TwitterNotificationService: Service<TwitterNotificationArticle> = {
	...newService('TwitterNotification'),
	fetch: twitterFetch,
	isOnDomain: globalThis.window?.location?.hostname === 'twitter.com'
		|| globalThis.window?.location?.hostname === 'x.com',
	fetchInfo: {
		type: FetchType.Tab,
		tabInfo: {
			url: 'https://twitter.com',
			matchUrl: ['*://twitter.com/*'],
			tabId: writable(null),
		}
	},
	filterTypes: {
		deleted: {
			type: 'deleted',
			name: 'Deleted',
			invertedName: 'Not deleted',
			props: {},
		},
		//TODO Replace with notificationType
		onRetweet: {
			type: 'onRetweet',
			name: 'On retweet',
			invertedName: 'Not on retweet',
			props: {},
		},
		recommendation: {
			type: 'recommendation',
			name: 'Recommendation',
			invertedName: 'Not recommendation',
			props: {},
		},
	},
	keepArticle(articleWithRefs: ArticleWithRefs, _index: number, filter: Filter & {type: keyof typeof TwitterNotificationService.filterTypes;}): boolean {
		const rootArticle = getRootArticle(articleWithRefs) as TwitterNotificationArticle;

		switch (filter.type) {
			case 'deleted':
				return rootArticle.deleted;
			case 'onRetweet':
				switch (rootArticle.type) {
					case NotificationType.UsersLikedYourRetweet:
					case NotificationType.UsersRetweetedYourRetweet:
					case NotificationType.UserLikedMultipleOfYourRetweets:
					case NotificationType.UserRetweetedMultipleOfYourRetweets:
						return true;
					default:
						return false;
				}
			case 'recommendation':
				return rootArticle.type === NotificationType.GenericMagicRecFirstDegreeTweetRecent;
			default:
				throw new Error('Unknown filter type: ' + filter.type);
		}
	},
};

registerService(TwitterNotificationService);