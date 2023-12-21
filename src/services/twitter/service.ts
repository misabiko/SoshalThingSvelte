import type TwitterArticle from './article';
import {getWritable, type Service} from '../service';
import {newService, registerService} from '../service';
import {STANDARD_ACTIONS} from '../actions';
import Article, {
	type ArticleIdPair,
	type ArticleWithRefs,
	articleWithRefToArray,
	getActualArticle,
	getRootArticle
} from '../../articles';
import type {Filter} from '../../filters';
import {type FavoriteResponse, type ResponseError, type RetweetResponse} from './pageAPI';
import { getCookie, getServiceStorage } from 'storages';
import { fetchExtension } from 'services/extension';
import {get, writable} from 'svelte/store';
import ServiceSettings from './ServiceSettings.svelte';

//TODO Add TwitterNotificationService
export const TwitterService: Service<TwitterArticle> = {
	...newService('Twitter'),
	articleActions: {
		[STANDARD_ACTIONS.like.key]: {
			...STANDARD_ACTIONS.like,
			//TODO Disable actions when twitter isn't available, but also don't parse localstorage for every article
			action: toggleLikePage,
			actioned(article) { return article.liked; },
			disabled(article) { return article.deleted; },
			count(article) { return article.likeCount; },
		},
		[STANDARD_ACTIONS.repost.key]: {
			...STANDARD_ACTIONS.repost,
			togglable: false,
			action: retweetPage,
			actioned(article) { return article.retweeted; },
			disabled(article) { return article.deleted; },
			count(article) { return article.retweetCount; },
		},
	},
	keepArticle(articleWithRefs: ArticleWithRefs, index: number, filter: Filter): boolean {
		if ((getRootArticle(articleWithRefs).constructor as typeof Article).service !== 'Twitter')
			return true;

		switch (filter.type) {
			case 'deleted':
				return (getRootArticle(articleWithRefs) as TwitterArticle).deleted;
			case 'liked':
				return (articleWithRefToArray(articleWithRefs) as TwitterArticle[])
					.some(a => a.liked)
			case 'retweeted':
				return (articleWithRefToArray(articleWithRefs) as TwitterArticle[])
					.some(a => a.retweeted)
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

		if (this.isOnDomain) {
			const csrfToken = getCookie('ct0');
			if (csrfToken === null)
				throw new Error('Csrf token not found');
			(init.headers as Record<string, string>)['X-Csrf-Token'] = csrfToken;

			const response = await fetch(url, init);
			return await response.json();
		}else if (this.tabInfo) {
			let tabId = get(this.tabInfo.tabId);
			if (tabId === null) {
				this.tabInfo.tabId.set(tabId = await fetchExtension('getTabId', {
					url: this.tabInfo.url,
					matchUrl: this.tabInfo.matchUrl
				}));
			}

			return await fetchExtension('domainFetch', {
				tabId,
				message: {
					soshalthing: true,
					request: 'fetch',
					fetch: url,
					fetchOptions: {
						...init,
						headers: {
							'Authorization': 'Bearer ' + bearerToken,
							...((init as any).headers ?? {}),
						},
					}
				}
			});
		}else {
			throw new Error('Service is not on domain and has no tab info');
		}
	},
	sortMethods: {
		likes: {
			name: 'Likes',
			compare(a, b) {
				return ((getActualArticle(a) as TwitterArticle).likeCount || 0) - ((getActualArticle(b) as TwitterArticle).likeCount || 0)
			},
			directionLabel(reversed: boolean): string {
				return reversed ? 'Descending' : 'Ascending'
			}
		},
		retweets: {
			name: 'Retweets',
			compare(a, b) {
				return ((getActualArticle(a) as TwitterArticle).retweetCount || 0) - ((getActualArticle(b) as TwitterArticle).retweetCount || 0)
			},
			directionLabel(reversed: boolean): string {
				return reversed ? 'Descending' : 'Ascending'
			}
		}
	},
	filterTypes: {
		liked: {
			name: (inverted) => inverted ? 'Not liked' : 'Liked',
			props: [],
		},
		retweeted: {
			name: (inverted) => inverted ? 'Not retweeted' : 'Retweeted',
			props: [],
		},
		deleted: {
			name: (inverted) => inverted ? 'Not deleted' : 'Deleted',
			props: [],
		},
	},
	isOnDomain: globalThis.window?.location?.hostname === 'twitter.com'
		|| globalThis.window?.location?.hostname === 'x.com',
	tabInfo: {
		url: 'https://twitter.com',
		matchUrl: ['*://twitter.com/*'],
		tabId: writable(null),
	},
	settings: ServiceSettings,
};

registerService(TwitterService);

export async function toggleLikePage(idPair: ArticleIdPair) {
	const writable = getWritable<TwitterArticle>(idPair);
	const liked = get(writable).liked;
	const [queryId, endpoint] = liked
		? ['ZYKSe-w7KEslx3JhSIk5LA', 'UnfavoriteTweet']
		: ['lI07N6Otwv1PhnEgXILM7A', 'FavoriteTweet'];

	try {
		const response = await pageRequest<FavoriteResponse>(queryId, endpoint, idPair.id.toString());

		if (response.errors !== undefined)
			throw response;
		if ((liked ? response.data.unfavorite_tweet : response.data.favorite_tweet) === 'Done')
			writable.update(a => {
				a.liked = !liked;
				return a;
			});
		else
			throw response;
	} catch (cause: ResponseError | any) {
		let shouldThrow = true;
		if (cause.errors !== undefined) {
			for (const err of (cause as ResponseError).errors)
				switch (err.code) {
					case 139:
						console.warn(cause);
						writable.update(a => {
							a.liked = true;
							return a;
						});

						if (cause.errors.length === 1)
							shouldThrow = false;
						break;
					case 144:
						writable.update(a => {
							a.deleted = true;
							return a;
						});

						if (cause.errors.length === 1)
							shouldThrow = false;
						break;
				}
		}

		if (shouldThrow)
			throw cause;
	}
}

export async function retweetPage(idPair: ArticleIdPair) {
	const writable = TwitterService.articles[idPair.id as string];
	if (get(writable).retweeted)
		return;

	try {
		const response = await pageRequest<RetweetResponse>('ojPdsZsimiJrUGLR1sjUtA', 'CreateRetweet', idPair.id.toString());

		if (response.errors !== undefined)
			throw response;
		if (response.data.create_retweet !== undefined)
			writable.update(a => {
				a.retweeted = true;
				return a;
			});
		else
			throw response;
	} catch (err: ResponseError | any) {
		if (err.errors !== undefined) {
			if ((err as ResponseError).errors.some(e => e.code === 144)) {
				writable.update(a => {
					a.deleted = true;
					return a;
				});
				if (err.errors.length === 1)
					return;
			}
		}

		throw new Error(err);
	}
}

async function pageRequest<T>(queryId: string, endpoint: string, tweetId: string): Promise<T> {
	return await TwitterService.fetch(`https://twitter.com/i/api/graphql/${queryId}/${endpoint}`, {
		method: 'POST',

		headers: {
			'Content-Type': 'application/json',
		},

		body: JSON.stringify({
			queryId,
			variables: {
				tweet_id: tweetId,
			}
		})
	});
}