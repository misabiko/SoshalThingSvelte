import type Article from './article'
import type { ArticleId, ArticleIdPair, ArticleWithRefs } from './article'
import {getRefed} from './article'
import type {Writable} from 'svelte/store'
import {writable} from 'svelte/store'
import type {TimelineEndpoint} from '../timelines'
import {keepArticle} from '../filters'
import {updateCachedArticlesStorage, updateHiddenStorage, updateMarkAsReadStorage} from '../storages/serviceCache'

const endpoints: { [name: string]: Endpoint } = {}
const services: { [name: string]: Service } = {}
const endpointConstructors: { [service: string]: EndpointConstructorInfo[] } = {}

export interface Service<A extends Article = Article> {
	readonly name: string;
	readonly articles: { [id: string]: Writable<A> };
	articleActions: { [name: string]: ArticleAction };
	requestImageLoad?: (id: ArticleId, index: number) => void;
	fetchArticle?: (id: ArticleId) => void;
	getCachedArticles?: () => {[id: string]: object}
}

type ArticleAction = {
	action: (idPair: ArticleIdPair) => void;
	togglable: boolean;
};

export const STANDARD_ACTIONS = {
	like: 'like',
	repost: 'repost',
};

export function articleAction(action: string, idPair: ArticleIdPair) {
	if (services[idPair.service].articleActions.hasOwnProperty(action))
		services[idPair.service].articleActions[action].action(idPair)
	else
		console.warn(`${idPair.service} doesn't have action ${action}.`)
}

export function getArticleAction(action: string, service: string) {
	const actions = services[service].articleActions
	if (actions.hasOwnProperty(action))
		return actions[action]
}

export function addArticles(service: Service, ignoreRefs: boolean, ...articles: ArticleWithRefs[]) {
	for (const {article, actualArticleRef, replyRef} of articles) {
		//https://github.com/microsoft/TypeScript/issues/46395
		service.articles[article.idPair.id as string] = writable(article)
		if (!ignoreRefs && actualArticleRef)
			for (const ref of getRefed(actualArticleRef)) {
				if (!service.articles.hasOwnProperty(ref.idPair.id as string))
					service.articles[ref.idPair.id as string] = writable(ref)
			}
		if (replyRef && (!ignoreRefs || !service.articles.hasOwnProperty(replyRef.idPair.id as string)))
			service.articles[replyRef.idPair.id.toString()] = writable(replyRef)
	}

	updateCachedArticlesStorage()
}

export abstract class Endpoint {
	abstract readonly name: string
	readonly articleIdPairs: ArticleIdPair[] = []
	refreshTypes = new Set<RefreshType>([RefreshType.RefreshStart, RefreshType.Refresh])
	rateLimitInfo: RateLimitInfo | null = null
	isAutoRefreshing = false
	abstract autoRefreshInterval: number

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

export function registerService(service: Service) {
	services[service.name] = service
}

export function registerEndpoint(service: Service, ...endpointInfos: EndpointConstructorInfo[]) {
	endpointConstructors[service.name] ??= []
	for (const endpointInfo of endpointInfos) {
		if (endpointInfo === undefined)
			console.error(`Missing endpoint constructor info for service ${service.name}`, endpointInfos)
		endpointConstructors[service.name].push(endpointInfo)
	}
}

export function addEndpoint(endpoint: Endpoint) {
	if (endpoints.hasOwnProperty(endpoint.name))
		console.warn(`Endpoint ${endpoint.name} already exists`)
	else
		endpoints[endpoint.name] = endpoint
}

export function getServices(): Readonly<{ [name: string]: Service }> {
	return services
}

export function getEndpoints(): Readonly<{ [name: string]: Endpoint }> {
	return endpoints
}

export function getEndpointConstructors(): Readonly<{ [service: string]: EndpointConstructorInfo[] }> {
	return endpointConstructors
}

export function toggleMarkAsRead(idPair: ArticleIdPair) {
	getWritable(idPair).update(a => {
		a.markedAsRead = !a.markedAsRead
		return a
	})

	updateMarkAsReadStorage()
}

export function toggleHide(idPair: ArticleIdPair) {
	getWritable(idPair).update(a => {
		a.hidden = !a.hidden
		return a
	})

	updateHiddenStorage()
}

export function getWritable<T extends Article = Article>(idPair: ArticleIdPair): Writable<T> {
	//Type casting might not be a great idea, no guarantee that the service returns T
	return services[idPair.service].articles[idPair.id as string] as Writable<T>
}

//TODO Add articles to other timelines
export async function refreshEndpoints(timelineEndpoints: TimelineEndpoint[], refreshType: RefreshType): Promise<ArticleIdPair[]> {
	const articleIdPairs = []
	for (const timelineEndpoint of timelineEndpoints)
		if (timelineEndpoint.refreshTypes.has(refreshType) && endpoints[timelineEndpoint.name].refreshTypes.has(refreshType)) {
			if (endpoints[timelineEndpoint.name].isRateLimited()) {
				const secondsLeft = Math.ceil((((endpoints[timelineEndpoint.name].rateLimitInfo as RateLimitInfo).reset * 1000) - Date.now()) / 1000)
				console.log(`${timelineEndpoint.name} is rate limited, and resets in ${secondsLeft} seconds.`, endpoints[timelineEndpoint.name].rateLimitInfo)
			}else
				articleIdPairs.push(...endpointRefreshed(timelineEndpoint, await endpoints[timelineEndpoint.name].refresh(refreshType)))
		}

	return articleIdPairs
}

function endpointRefreshed(endpoint: TimelineEndpoint, articles: ArticleWithRefs[]): ArticleIdPair[] {
	if (!articles.length)
		return []
	//TODO Store service name on endpoint
	const service = (articles[0].article.constructor as typeof Article).service

	addArticles(services[service], false, ...articles)
	const addedArticles = articles
		.filter(articleWithRefs => {
			return !endpoints[endpoint.name].articleIdPairs
					.some(pair =>
						pair.service === articleWithRefs.article.idPair.service &&
						pair.id === articleWithRefs.article.idPair.id,
					) &&
				endpoint.filters.every(f => !f.enabled || (keepArticle(articleWithRefs, f.filter) !== f.inverted))
		})

	const addedIdPairs = addedArticles.map(a => a.article.idPair)
	endpoints[endpoint.name].articleIdPairs.push(...addedIdPairs)

	return addedIdPairs
}

export function fetchArticle(idPair: ArticleIdPair) {
	const service = services[idPair.service]
	const fetchArticle = service.fetchArticle
	if (fetchArticle !== undefined)
		fetchArticle(idPair.id);
}