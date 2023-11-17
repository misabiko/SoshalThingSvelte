import {TwitterService} from './service';
import type {SearchResponse, TweetResponse} from './apiV1';
import {articleFromV1, fetchExtensionV1, getV1APIURL, parseRateLimitInfo} from './apiV1';
import {Endpoint, RefreshType} from '../endpoints';
import type {EndpointConstructorInfo} from '../endpoints';
import {fetchExtension} from '../extension';
import { parseHTMLArticle } from './page';
import type { ArticleWithRefs } from 'articles';
import TwitterUserTweetsAPIEndpoint from './endpoints/websocket/UserTweetsAPI';
import TwitterForYouTimelineAPIEndpoint from './endpoints/websocket/ForYouTimelineAPI';
import TwitterListAPIEndpoint from './endpoints/websocket/ListAPI';
import TwitterFollowingTimelineAPIEndpoint from './endpoints/websocket/FollowingTimelineAPI';
import TwitterUserMediaAPIEndpoint from './endpoints/websocket/UserMediaAPI';

//TODO Move to V1 directory, split into separate files
abstract class V1Endpoint extends Endpoint {
	readonly service = TwitterService.name;

	//Waiting on https://github.com/microsoft/TypeScript/issues/34516 to make static
	abstract readonly resource: string
	abstract readonly maxCount: number

	constructor() {
		super(new Set([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
			RefreshType.LoadBottom,
		]));
	}

	async refresh(refreshType: RefreshType) {
		const url = new URL(getV1APIURL(this.resource));
		this.setSearchParams(url, refreshType);

		try {
			return await this.fetchTweets(url);
		}catch (errorResponse) {
			console.error('Error fetching', errorResponse);
			return [];
		}
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		url.searchParams.set('include_entities', 'true');
		url.searchParams.set('tweet_mode', 'extended');
		if (this.articleIdPairs.length && refreshType === RefreshType.LoadBottom)
			url.searchParams.set('max_id', this.articleIdPairs.reduce((acc, curr) => curr.id < acc.id ? curr : acc).id.toString());
		if (this.articleIdPairs.length && refreshType === RefreshType.LoadTop)
			url.searchParams.set('since_id', this.articleIdPairs.reduce((acc, curr) => curr.id > acc.id ? curr : acc).id.toString());

		if (this.articleIdPairs.length)
			url.searchParams.set('count', this.maxCount.toString());
	}

	async fetchTweets(url: URL): Promise<ArticleWithRefs[]> {
		const {json, headers} = await fetchExtensionV1<TweetResponse[]>(url.toString());
		this.rateLimitInfo = parseRateLimitInfo(headers);

		return json.map(a => articleFromV1(a));
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-home_timeline
export class HomeTimelineEndpoint extends V1Endpoint {
	readonly name = 'Home Timeline';
	readonly resource = 'statuses/home_timeline';
	readonly maxCount = 200;	//Default 20
	autoRefreshInterval = 90_000;	//Min 60_000

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'HomeTimelineEndpoint',
		paramTemplate: [],
		constructor: () => new HomeTimelineEndpoint()
	};
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline
export class UserTimelineEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'statuses/user_timeline';
	readonly maxCount = 200;
	autoRefreshInterval = 60_000;	//Min 1000

	constructor(readonly username: string, public includeRetweets: boolean) {
		super();

		this.name = `User Timeline ${this.username}`;
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType);
		url.searchParams.set('screen_name', this.username);
		url.searchParams.set('include_rts', this.includeRetweets.toString());
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'UserTimelineEndpoint',
		paramTemplate: [['username', ''], ['includeRetweets', true]],
		constructor: params => new UserTimelineEndpoint(params.username as string, params.includeRetweets as boolean)
	};
}

//https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/create-manage-lists/api-reference/get-lists-statuses
export class ListEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'lists/statuses';
	readonly maxCount = 200;	//Not mentionned, assuming 200
	autoRefreshInterval = 60_000;	//Min 1000

	constructor(readonly identifier: {
		type: 'slug',
		username: string,
		slug: string
	} | {
		type: 'id',
		id: string
	}, public includeRetweets: boolean) {
		super();

		switch (identifier.type) {
			case 'id':
				this.name = `List Endpoint ${identifier.id}`;
				break;
			case 'slug':
				this.name = `List Endpoint ${identifier.username}/${identifier.slug}`;
				break;
		}
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType);
		switch (this.identifier.type) {
			case 'id':
				url.searchParams.set('list_id', this.identifier.id);
				break;
			case 'slug':
				url.searchParams.set('owner_screen_name', this.identifier.username);
				url.searchParams.set('slug', this.identifier.slug);
				break;
		}
		url.searchParams.set('include_rts', this.includeRetweets.toString());
	}

	matchParams(params: any): boolean {
		switch (this.identifier.type) {
			case 'id':
				return params.id === this.identifier.id;
			case 'slug':
				return params.username === this.identifier.username &&
					params.slug === this.identifier.slug;
		}
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'ListEndpoint',
		paramTemplate: [
			['username', ''],
			['slug', ''],
			['id', ''],
			['includeRetweets', true]
		],
		constructor: params =>
			new ListEndpoint(
				params.id ? {
					type: 'id',
					id: params.id as string,
				} : {
					type: 'slug',
					username: params.username as string,
					slug: params.slug as string,
				},
				params.includeRetweets as boolean,
			)
	};
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list
export class LikesEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'favorites/list';
	readonly maxCount = 200;	//Default 20
	autoRefreshInterval = 60_000;	//Min 12_000

	constructor(readonly username: string) {
		super();

		this.name = `Likes ${this.username}`;
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType);
		url.searchParams.set('screen_name', this.username);
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'LikesEndpoint',
		paramTemplate: [['username', '']],
		constructor: params => new LikesEndpoint(params.username as string)
	};
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets
export class SearchEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'search/tweets';
	readonly maxCount = 100;	//Default 15
	autoRefreshInterval = 60_000;	//Min 5000

	constructor(readonly query: string) {
		super();

		this.name = `Search ${this.query}`;
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType);
		url.searchParams.set('q', this.query);
		url.searchParams.set('result_type', 'recent');
		url.searchParams.set('include_entities', 'true');
	}

	async fetchTweets(url: URL): Promise<ArticleWithRefs[]> {
		const {json, headers} = await fetchExtensionV1<SearchResponse>(url.toString());
		this.rateLimitInfo = parseRateLimitInfo(headers);

		return json.statuses.map(a => articleFromV1(a));
	}

	matchParams(params: any): boolean {
		return params.query === this.query;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'SearchEndpoint',
		paramTemplate: [['query', '']],
		constructor: params => new SearchEndpoint(params.query as string)
	};
}

export class TwitterHomeEndpoint extends Endpoint {
	readonly service = TwitterService.name;
	readonly name = 'Home Page';

	async refresh(_refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const listTabsResponse = await fetchExtension<any>('listTabs', {query: {url: '*://twitter.com/*'}});

		let tabId: number;
		if (Array.isArray(listTabsResponse) && listTabsResponse.length > 0)
			tabId = listTabsResponse[0].id;
		else
			throw new Error('No Twitter tab found');

		const pageResponse = await fetchExtension<any>('twitterFetch', {tabId, message: {
			soshalthing: true,
			request: 'getPageHTML',
		}});
		const html = document.createElement('html');
		html.innerHTML = pageResponse;
		const articlesHTML = html.getElementsByTagName('article');

		const articles = [];
		for (const articleHTML of articlesHTML) {
			try {
				const article = parseHTMLArticle(articleHTML);
				if (article === null)
					continue;
				articles.push(article);
			}catch (error) {
				console.error('Error parsing article', error, articleHTML);
			}
		}
		return articles;
	}

	matchParams(_params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterHomeEndpoint',
		paramTemplate: [],
		constructor: _params => new TwitterHomeEndpoint()
	};
}


TwitterService.endpointConstructors.push(
	HomeTimelineEndpoint.constructorInfo,
	UserTimelineEndpoint.constructorInfo,
	ListEndpoint.constructorInfo,
	LikesEndpoint.constructorInfo,
	SearchEndpoint.constructorInfo,
	TwitterHomeEndpoint.constructorInfo,
	TwitterUserTweetsAPIEndpoint.constructorInfo,
	TwitterForYouTimelineAPIEndpoint.constructorInfo,
	TwitterFollowingTimelineAPIEndpoint.constructorInfo,
	TwitterListAPIEndpoint.constructorInfo,
	TwitterUserMediaAPIEndpoint.constructorInfo,
);

TwitterService.userEndpoint = user => new TwitterUserMediaAPIEndpoint(user.username);