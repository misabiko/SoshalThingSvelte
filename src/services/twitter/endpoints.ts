import type {ArticleWithRefs} from '../../articles'
import {TwitterService} from './service'
import type {SearchResponse, TweetResponse} from './apiV1'
import {articleFromV1, fetchExtensionV1, getV1APIURL, parseRateLimitInfo} from './apiV1'
import {Endpoint, RefreshType} from '../endpoints'
import type {EndpointConstructorInfo} from '../endpoints'

abstract class V1Endpoint extends Endpoint {
	readonly service = TwitterService.name

	//Waiting on https://github.com/microsoft/TypeScript/issues/34516 to make static
	abstract readonly resource: string
	abstract readonly maxCount: number

	constructor() {
		super(new Set([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
			RefreshType.LoadBottom,
		]))
	}

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
		url.searchParams.set('tweet_mode', 'extended')
		if (this.articleIdPairs.length && refreshType === RefreshType.LoadBottom)
			url.searchParams.set('max_id', this.articleIdPairs.reduce((acc, curr) => curr.id < acc.id ? curr : acc).id.toString())
		if (this.articleIdPairs.length && refreshType === RefreshType.LoadTop)
			url.searchParams.set('since_id', this.articleIdPairs.reduce((acc, curr) => curr.id > acc.id ? curr : acc).id.toString())

		if (this.articleIdPairs.length)
			url.searchParams.set('count', this.maxCount.toString())
	}

	async fetchTweets(url: URL): Promise<ArticleWithRefs[]> {
		const {json, headers} = await fetchExtensionV1<TweetResponse[]>(url.toString())
		this.rateLimitInfo = parseRateLimitInfo(headers)

		return json.map(a => articleFromV1(a))
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-home_timeline
export class HomeTimelineEndpoint extends V1Endpoint {
	readonly name = 'Home Timeline'
	readonly resource = 'statuses/home_timeline'
	readonly maxCount = 200	//Default 20
	autoRefreshInterval = 90_000	//Min 60_000

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
	autoRefreshInterval = 60_000	//Min 1000

	constructor(readonly username: string, public includeRetweets: boolean) {
		super()

		this.name = `User Timeline ${this.username}`
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType)
		url.searchParams.set('screen_name', this.username)
		url.searchParams.set('include_rts', this.includeRetweets.toString())
	}

	matchParams(params: any): boolean {
		return params.username === this.username;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'UserTimelineEndpoint',
		paramTemplate: [['username', ''], ['includeRetweets', true]],
		constructor: params => new UserTimelineEndpoint(params.username as string, params.includeRetweets as boolean)
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/create-manage-lists/api-reference/get-lists-statuses
export class ListEndpoint extends V1Endpoint {
	readonly name;
	readonly resource = 'lists/statuses'
	readonly maxCount = 200	//Not mentionned, assuming 200
	autoRefreshInterval = 60_000	//Min 1000

	constructor(readonly username: string, readonly slug: string, public includeRetweets: boolean) {
		super()

		this.name = `List Endpoint ${this.username}/${this.slug}`
	}

	setSearchParams(url: URL, refreshType: RefreshType) {
		super.setSearchParams(url, refreshType)
		url.searchParams.set('owner_screen_name', this.username)
		url.searchParams.set('slug', this.slug)
		url.searchParams.set('include_rts', this.includeRetweets.toString())
	}

	matchParams(params: any): boolean {
		return params.username === this.username &&
			params.slug === this.slug;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'ListEndpoint',
		paramTemplate: [['username', ''], ['slug', ''], ['includeRetweets', true]],
		constructor: params => new ListEndpoint(
			params.username as string,
			params.slug as string,
			params.includeRetweets as boolean,
		)
	}
}

//https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-favorites-list
export class LikesEndpoint extends V1Endpoint {
	readonly name
	readonly resource = 'favorites/list'
	readonly maxCount = 200	//Default 20
	autoRefreshInterval = 60_000	//Min 12_000

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
	autoRefreshInterval = 60_000	//Min 5000

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
		const {json, headers} = await fetchExtensionV1<SearchResponse>(url.toString())
		this.rateLimitInfo = parseRateLimitInfo(headers)

		return json.statuses.map(a => articleFromV1(a))
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

//TODO Thread/ConversationEndpoint

TwitterService.endpointConstructors.push(
	HomeTimelineEndpoint.constructorInfo,
	UserTimelineEndpoint.constructorInfo,
	ListEndpoint.constructorInfo,
	LikesEndpoint.constructorInfo,
	SearchEndpoint.constructorInfo,
)

//TODO Use filters to check if we include retweets
TwitterService.userEndpoint = username => new UserTimelineEndpoint(username, false)