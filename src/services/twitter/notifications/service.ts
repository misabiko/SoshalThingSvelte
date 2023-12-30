import {FetchType, newService, registerService, type Service} from '../../service';
import TwitterNotificationArticle, {NotificationType} from './article';
import {twitterFetch} from '../service';
import {writable} from 'svelte/store';
import Article, {type ArticleWithRefs, getRootArticle} from '~/articles';
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
		//TODO Replace with notificationType
		onRetweet: {
			name: (inverted) => inverted ? 'Not on retweet' : 'On retweet',
			props: [],
		},
	},
	keepArticle(articleWithRefs: ArticleWithRefs, _index: number, filter: Filter): boolean {
		if ((getRootArticle(articleWithRefs).constructor as typeof Article).service !== 'TwitterNotification')
			return true;

		switch (filter.type) {
			case 'onRetweet':
				switch ((getRootArticle(articleWithRefs) as TwitterNotificationArticle).type) {
					case NotificationType.UsersLikedYourRetweet:
					case NotificationType.UsersRetweetedYourRetweet:
						return true;
					default:
						return false;
				}
			default:
				return true;
		}
	},
}

registerService(TwitterNotificationService);