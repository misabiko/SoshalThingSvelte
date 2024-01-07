import type TwitterArticle from './article';
import {addArticles, FetchType, getWritable, type Service} from '~/services/service';
import {newService, registerService} from '~/services/service';
import {STANDARD_ACTIONS} from '~/services/actions';
import Article, {
	type ArticleIdPair,
	type ArticleWithRefs,
	articleWithRefToArray,
	getActualArticle,
	getRootArticle
} from '~/articles';
import type {Filter} from '~/filters';
import {
	type FavoriteResponse,
	type Instruction,
	parseResponse,
	type ResponseError, type ResponseSingleError,
	type RetweetResponse
} from './pageAPI';
import {getCookie, getServiceStorage} from '~/storages';
import {fetchExtension} from '~/services/extension';
import {get, writable} from 'svelte/store';
import ServiceSettings from './ServiceSettings.svelte';

//TODO Twitter conversation timeline
export const TwitterService: Service<TwitterArticle> = {
	...newService('Twitter'),
	loadArticle,
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
		switch (filter.type) {
			case 'deleted':
				return (getRootArticle(articleWithRefs) as TwitterArticle).deleted;
			case 'liked':
				return (articleWithRefToArray(articleWithRefs) as TwitterArticle[])
					.some(a => a.liked);
			case 'retweeted':
				return (articleWithRefToArray(articleWithRefs) as TwitterArticle[])
					.some(a => a.retweeted);
			default:
				throw new Error('Unknown filter type: ' + filter.type);
		}
	},
	fetch: twitterFetch,
	sortMethods: {
		likes: {
			name: 'Likes',
			compare(a, b) {
				return ((getActualArticle(a) as TwitterArticle).likeCount || 0) - ((getActualArticle(b) as TwitterArticle).likeCount || 0);
			},
			directionLabel(reversed: boolean): string {
				return reversed ? 'Descending' : 'Ascending';
			}
		},
		retweets: {
			name: 'Retweets',
			compare(a, b) {
				return ((getActualArticle(a) as TwitterArticle).retweetCount || 0) - ((getActualArticle(b) as TwitterArticle).retweetCount || 0);
			},
			directionLabel(reversed: boolean): string {
				return reversed ? 'Descending' : 'Ascending';
			}
		}
	},
	filterTypes: {
		liked: {
			type: 'liked',
			name: 'Liked',
			invertedName: 'Not liked',
			props: {},
		},
		retweeted: {
			type: 'retweeted',
			name: 'Retweeted',
			invertedName: 'Not retweeted',
			props: {},
		},
		deleted: {
			type: 'deleted',
			name: 'Deleted',
			invertedName: 'Not deleted',
			props: {},
		},
	},
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

export async function twitterFetch(url: RequestInfo | URL, init: RequestInit = {}) {
	const bearerToken = getServiceStorage(TwitterService.name).bearerToken;
	if (!bearerToken)
		throw new Error('Bearer token not found');

	if (init.headers === undefined)
		init.headers = {};
	(init.headers as Record<string, string>)['Authorization'] = `Bearer ${bearerToken}`;

	if (TwitterService.isOnDomain) {
		const csrfToken = getCookie('ct0');
		if (csrfToken === null)
			throw new Error('Csrf token not found');
		(init.headers as Record<string, string>)['X-Csrf-Token'] = csrfToken;

		const response = await fetch(url, init);
		return await response.json();
	}else if (TwitterService.fetchInfo.tabInfo) {
		let tabId = get(TwitterService.fetchInfo.tabInfo.tabId);
		if (tabId === null) {
			TwitterService.fetchInfo.tabInfo.tabId.set(tabId = await fetchExtension('getTabId', {
				url: TwitterService.fetchInfo.tabInfo.url,
				matchUrl: TwitterService.fetchInfo.tabInfo.matchUrl
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
}

export async function loadArticle(id: string): Promise<ArticleWithRefs | null> {
	const variables = {
		focalTweetId: id,
		with_rux_injections: false,
		includePromotedContent: false,
		withCommunity: false,
		withQuickPromoteEligibilityTweetFields: false,
		withBirdwatchNotes: false,
		withVoice: true,
		withV2Timeline: true
	};
	const features = {
		responsive_web_graphql_exclude_directive_enabled:true,
		verified_phone_label_enabled:false,
		creator_subscriptions_tweet_preview_api_enabled:true,
		responsive_web_graphql_timeline_navigation_enabled:true,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled:false,
		c9s_tweet_anatomy_moderator_badge_enabled:true,
		tweetypie_unmention_optimization_enabled:true,
		responsive_web_edit_tweet_api_enabled:true,
		graphql_is_translatable_rweb_tweet_is_translatable_enabled:true,
		view_counts_everywhere_api_enabled:true,
		longform_notetweets_consumption_enabled:true,
		responsive_web_twitter_article_tweet_consumption_enabled:false,
		tweet_awards_web_tipping_enabled:false,
		freedom_of_speech_not_reach_fetch_enabled:true,
		standardized_nudges_misinfo:true,
		tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:true,
		rweb_video_timestamps_enabled:true,
		longform_notetweets_rich_text_read_enabled:true,
		longform_notetweets_inline_media_enabled:true,
		responsive_web_media_download_video_enabled:false,
		responsive_web_enhance_cards_enabled:false,
	};
	const fieldToggles = {
		withArticleRichContentState: false,
	};

	const url = new URL('https://twitter.com/i/api/graphql/-H4B_lJDEA-O_7_qWaRiyg/TweetDetail');
	url.searchParams.set('variables', JSON.stringify(variables));
	url.searchParams.set('features', JSON.stringify(features));
	url.searchParams.set('fieldToggles', JSON.stringify(fieldToggles));

	const response: { errors: ResponseSingleError[] } | TweetDetailsResponse = await TwitterService.fetch(url, {
		headers: {
			'Accept': 'application/json',
		}
	});

	if (response.errors !== undefined)
		throw response;

	const articles = parseResponse(response.data.threaded_conversation_with_injections_v2.instructions);

	addArticles(false, ...articles);

	return articles[0] ?? null;
}
type TweetDetailsResponse = {
	data: {
		threaded_conversation_with_injections_v2: {
			instructions: Instruction[]
		}
	}
	errors?: never
}