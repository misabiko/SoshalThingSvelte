import type {TimelineEndpoint} from '../timelines'
import type {ArticleIdPair, ArticleWithRefs} from './article'
import {keepArticle} from '../filters'
import {addArticles, getServices} from './service'

const endpoints: { [name: string]: Endpoint } = {}

export abstract class Endpoint {
	abstract readonly name: string
	abstract readonly service: string
	readonly articleIdPairs: ArticleIdPair[] = []
	rateLimitInfo: RateLimitInfo | null = null
	isAutoRefreshing = false
	autoRefreshInterval = 90_000

	constructor(
		public refreshTypes = new Set<RefreshType>([
			RefreshType.RefreshStart,
			RefreshType.Refresh,
		]),
	) {
	}

	abstract refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]>;

	abstract matchParams(params: any): boolean

	isRateLimited(): boolean {
		if (this.rateLimitInfo === null)
			return false
		else
			return this.rateLimitInfo.remaining <= 0
	}

	static readonly constructorInfo: EndpointConstructorInfo
}

export interface EndpointConstructorInfo {
	readonly name: string;
	readonly paramTemplate: [string, ParamType][];
	readonly constructor: (params: EndpointConstructorParams) => Endpoint;
}

export type EndpointConstructorParams = { [param: string]: ParamType };

export enum RefreshType {
	RefreshStart,
	Refresh,
	LoadTop,
	LoadBottom,
}

export const everyRefreshType = new Set([
	RefreshType.RefreshStart,
	RefreshType.Refresh,
	RefreshType.LoadBottom,
	RefreshType.LoadTop,
])

type ParamType = string | number | boolean;

//Format specific to Twitter
export type RateLimitInfo = {
	limit: number;
	remaining: number;
	reset: number;
}

export function addEndpoint(endpoint: Endpoint) {
	if (endpoints.hasOwnProperty(endpoint.name))
		console.warn(`Endpoint ${endpoint.name} already exists`)
	else
		endpoints[endpoint.name] = endpoint
}

export function getEndpoints(): Readonly<{ [name: string]: Endpoint }> {
	return endpoints
}

//TODO Add articles to other timelines
export async function refreshEndpoints(timelineEndpoints: TimelineEndpoint[], refreshType: RefreshType): Promise<ArticleIdPair[]> {
	const articleIdPairs = []
	for (const timelineEndpoint of timelineEndpoints) {
		const endpoint = timelineEndpoint.name !== undefined ? endpoints[timelineEndpoint.name] : timelineEndpoint.endpoint

		if (timelineEndpoint.refreshTypes.has(refreshType) && endpoint.refreshTypes.has(refreshType)) {
			if (endpoint.isRateLimited()) {
				const secondsLeft = Math.ceil((((endpoint.rateLimitInfo as RateLimitInfo).reset * 1000) - Date.now()) / 1000)
				console.log(`${timelineEndpoint.name} is rate limited, and resets in ${secondsLeft} seconds.`, endpoint.rateLimitInfo)
			}else
				articleIdPairs.push(...endpointRefreshed(timelineEndpoint, await endpoint.refresh(refreshType)))
		}
	}

	return articleIdPairs
}

function endpointRefreshed(timelineEndpoint: TimelineEndpoint, articles: ArticleWithRefs[]): ArticleIdPair[] {
	if (!articles.length)
		return []

	const endpoint = timelineEndpoint.name !== undefined ? endpoints[timelineEndpoint.name] : timelineEndpoint.endpoint
	endpoint.articleIdPairs.push(...articles
		.filter(a => !endpoint.articleIdPairs
			.some(pair =>
				pair.service === a.article.idPair.service &&
				pair.id === a.article.idPair.id,
			))
		.map(a => a.article.idPair),
	)

	addArticles(getServices()[endpoint.service], false, ...articles)
	const addedArticles = articles
		.filter(articleWithRefs =>
			timelineEndpoint.filters.every(f => !f.enabled || (keepArticle(articleWithRefs, f.filter) !== f.inverted)),
		)

	return addedArticles.map(a => a.article.idPair)
}