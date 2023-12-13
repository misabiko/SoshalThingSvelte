import TwitterArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import {STANDARD_ACTIONS} from '../actions';
import Article, {type ArticleWithRefs, getRootArticle} from '../../articles';
import type {Filter} from '../../filters';
import { retweetPage, retweetWebSocket, toggleLikePage, toggleLikeWebSocket } from './pageAPI';
import { getCookie, getServiceStorage } from 'storages';
import { fetchExtension } from 'services/extension';

export const isOnTwitter = globalThis.window?.location?.hostname === 'twitter.com';

export const TwitterService: Service<TwitterArticle> = {
	...newService('Twitter'),
	articleActions: {
		[STANDARD_ACTIONS.like.key]: {
			...STANDARD_ACTIONS.like,
			//TODO Disable actions when twitter isn't available, but also don't parse localstorage for every article
			action: toggleLikePage,
			actionned(article) { return article.liked; },
			disabled(article) { return article.deleted; },
			count(article) { return article.likeCount; },
		},
		[STANDARD_ACTIONS.repost.key]: {
			...STANDARD_ACTIONS.repost,
			togglable: false,
			action: retweetPage,
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
	},
	async fetch(url, init = {}) {
		const bearerToken = getServiceStorage(this.name).bearerToken;
		if (!bearerToken)
			throw new Error('Bearer token not found');

		if (init.headers === undefined)
			init.headers = {};
		(init.headers as Record<string, string>)['Authorization'] = `Bearer ${bearerToken}`;

		if (isOnTwitter) {
			if (init?.headers === undefined)
				throw new Error('Cannot fetch on twitter service without headers');

			const csrfToken = getCookie('ct0');
			if (csrfToken === null)
				throw new Error('Csrf token not found');
			(init.headers as Record<string, string>)['X-Csrf-Token'] = csrfToken;

			const response = await fetch(url, init);
			return await response.json();
		}else {
			const listTabsResponse: any[] = await fetchExtension('listTabs', {query: {url: '*://twitter.com/*'}});
			const tabId = listTabsResponse[0].id;

			return await fetchExtension('twitterFetch', {
				tabId,
				message: {
					soshalthing: true,
					request: 'fetch',
					fetch: url,
					fetchOptions: {
						...init,
						headers: {
							'Authorization': 'Bearer ' + bearerToken,
							// 'X-Csrf-Token': csrfToken,
							...((init as any).headers ?? {}),
						},
					}
				}
			});
		}
	}
};
TwitterArticle.service = TwitterService.name;

registerService(TwitterService);