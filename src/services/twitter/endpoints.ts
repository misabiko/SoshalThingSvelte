import type {ArticleWithRefs} from '../article'
import {Endpoint, type EndpointConstructorInfo, RefreshType, registerEndpoint} from '../service'
import {fetchExtensionV1, TwitterService} from './service'
import type {SearchResponse, TweetResponse} from './apiV1'
import {articleFromV1, getV1APIURL} from './apiV1'

abstract class V1Endpoint extends Endpoint {
	//Waiting on https://github.com/microsoft/TypeScript/issues/34516 to make static
	abstract readonly resource: string
	abstract readonly maxCount: number

	//TODO Pass endpoint filters to exclude retweets
	async refresh(refreshType: RefreshType) {
		const url = new URL(getV1APIURL(this.resource))
		this.setSearchParams(url, refreshType)

		try {
			return await this.fetchTweets(url)
		}catch (errorResponse) {
			console.error('Error fetching', errorResponse)
			return []
		}
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		url.searchParams.set('include_entities', 'true')
		if (refreshType === RefreshType.LoadBottom)
			url.searchParams.set('max_id', this.articleIdPairs.reduce((acc, curr) => curr.id < acc.id ? curr : acc).id.toString())
		if (refreshType === RefreshType.LoadTop)
			url.searchParams.set('since_id', this.articleIdPairs.reduce((acc, curr) => curr.id > acc.id ? curr : acc).id.toString())

		if (this.articleIdPairs.length)
			url.searchParams.set('count', this.maxCount.toString())
	}

	async fetchTweets(url: URL): Promise<ArticleWithRefs[]> {
		return (await fetchExtensionV1<TweetResponse[]>(url.toString()))
			.map(articleFromV1)
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-home_timeline
export class HomeTimelineEndpoint extends V1Endpoint {
	readonly name = 'Home Timeline'
	readonly resource = 'statuses/home_timeline'
	readonly maxCount = 200	//Default 20
	refreshTypes = new Set([
		RefreshType.RefreshStart,
		RefreshType.Refresh,
		RefreshType.LoadBottom,
	])

	matchParams(params: any): boolean {
		return true;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'HomeTimelineEndpoint',
		paramTemplate: [],
		constructor: () => new HomeTimelineEndpoint()
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline
export class UserTimelineEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'statuses/user_timeline'
	readonly maxCount = 200

	constructor(readonly username: string) {
		super()

		this.name = `User Timeline ${this.username}`
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType)
		url.searchParams.set('screen_name', this.username)
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'UserTimelineEndpoint',
		paramTemplate: [['username', '']],
		constructor: params => new UserTimelineEndpoint(params.username as string)
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/create-manage-lists/api-reference/get-lists-statuses
export class ListEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'lists/statuses'
	readonly maxCount = 200	//Not mentionned, assuming 200

	constructor(readonly username: string, readonly slug: string) {
		super()

		this.name = `List Endpoint ${this.username}/${this.slug}`
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType)
		url.searchParams.set('owner_screen_name', this.username)
		url.searchParams.set('slug', this.slug)
	}

	matchParams(params: any): boolean {
		return params.username === this.username &&
			params.slug === this.slug;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'ListEndpoint',
		paramTemplate: [['username', ''], ['slug', '']],
		constructor: params => new ListEndpoint(params.username as string, params.slug as string)
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list
export class LikesEndpoint extends V1Endpoint {
	readonly name
	readonly resource = 'favorites/list'
	readonly maxCount = 200	//Default 20

	constructor(readonly username: string) {
		super()

		this.name = `Likes ${this.username}`
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType)
		url.searchParams.set('screen_name', this.username)
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'LikesEndpoint',
		paramTemplate: [['username', '']],
		constructor: params => new LikesEndpoint(params.username as string)
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/search/api-reference/get-search-tweets
export class SearchEndpoint extends V1Endpoint {
	readonly name
	readonly resource = 'search/tweets'
	readonly maxCount = 100	//Default 15

	constructor(readonly query: string) {
		super()

		this.name = `Search ${this.query}`
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType)
		url.searchParams.set('q', this.query)
		url.searchParams.set('result_type', 'recent')
		url.searchParams.set('include_entities', 'true')
	}

	async fetchTweets(url: URL): Promise<ArticleWithRefs[]> {
		return (await fetchExtensionV1<SearchResponse>(url.toString())).statuses
			.map(articleFromV1)
	}

	matchParams(params: any): boolean {
		return params.query === this.query;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'SearchEndpoint',
		paramTemplate: [['query', '']],
		constructor: params => new SearchEndpoint(params.query as string)
	}
}

registerEndpoint(TwitterService,
	HomeTimelineEndpoint.constructorInfo,
	UserTimelineEndpoint.constructorInfo,
	ListEndpoint.constructorInfo,
	LikesEndpoint.constructorInfo,
	SearchEndpoint.constructorInfo,
)