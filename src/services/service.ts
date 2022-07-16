import type Article from './article'
import type { ArticleIdPair, ArticleWithRefs } from './article'
import {getRefed} from './article'
import type {Writable} from 'svelte/store'
import {get, writable} from 'svelte/store'
import type {TimelineEndpoint} from '../timelines'
import {keepArticle} from '../filters'

const endpoints: { [name: string]: Endpoint } = {}
const services: { [name: string]: Service } = {}
const endpointConstructors: { [service: string]: EndpointConstructorInfo[] } = {}

const STORAGE_KEY = 'SoshalThingSvelte'

export interface Service {
	readonly name: string;
	readonly articles: { [id: string | number]: Writable<Article> };
	articleActions: { [name: string]: ArticleAction };
	requestImageLoad?: (id: string | number, index: number) => void;
	fetchArticle?: (id: string | number) => void;
	getCachedArticles?: () => {[id: string | number]: object}
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
	else
		console.warn(`${service} doesn't have action ${action}.`)
}

export function addArticles(service: Service, ...articles: ArticleWithRefs[]) {
	for (const {article, actualArticleRef, replyRef} of articles) {
		service.articles[article.idPair.id] = writable(article)
		if (actualArticleRef)
			for (const ref of getRefed(actualArticleRef))
				service.articles[ref.idPair.id] = writable(ref)
		if (replyRef)
			service.articles[replyRef.idPair.id] = writable(replyRef)
	}

	updateCachedArticlesStorage()
}

export abstract class Endpoint {
	abstract readonly name: string
	readonly articleIdPairs: ArticleIdPair[] = []
	refreshTypes = new Set<RefreshType>([RefreshType.RefreshStart, RefreshType.Refresh])

	abstract refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]>;

	abstract matchParams(params: any): boolean

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

type ParamType = string | number | boolean;

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
}

export function getWritable(idPair: ArticleIdPair): Writable<Article> {
	return services[idPair.service].articles[idPair.id]
}

function updateMarkAsReadStorage() {
	const item = sessionStorage.getItem(STORAGE_KEY)
	let storage = item !== null ? JSON.parse(item) : null
	if (storage === null)
		storage = {services: {}}

	for (const service of Object.values(services)) {
		const articlesMarkedAsRead = Object.values(service.articles)
			.map(a => {
				const value = get(a)
				return value.markedAsRead ? value.idPair.id : undefined
			})
			.filter(id => id !== undefined)

		if (storage.services.hasOwnProperty(service.name))
			storage.services[service.name].articlesMarkedAsRead = articlesMarkedAsRead
		else
			storage.services[service.name] = {
				articlesMarkedAsRead,
				cachedArticles: {},
			}
	}

	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

export function updateCachedArticlesStorage() {
	const item = sessionStorage.getItem(STORAGE_KEY)
	let storage = item !== null ? JSON.parse(item) : null
	if (storage === null)
		storage = {services: {}}

	for (const service of Object.values(services)) {
		const getCachedArticles = service.getCachedArticles
		if (getCachedArticles !== undefined) {
			const cachedArticles = getCachedArticles()

			if (storage.services.hasOwnProperty(service.name))
				storage.services[service.name].cachedArticles = cachedArticles
			else
				storage.services[service.name] = {
					articlesMarkedAsRead: [],
					cachedArticles,
				}
		}
	}

	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

//TODO Profile passing service vs service name
export function getMarkedAsReadStorage(service: Service): (string | number)[] {
	const item = sessionStorage.getItem(STORAGE_KEY)
	const parsed = item !== null ? JSON.parse(item) : null
	return parsed?.services[service.name]?.articlesMarkedAsRead || []
}

export function getCachedArticlesStorage(service: Service): {[id: string | number]: object} {
	const item = sessionStorage.getItem(STORAGE_KEY)
	const parsed = item !== null ? JSON.parse(item) : null
	return parsed?.services[service.name]?.cachedArticles || {}
}

//TODO Add articles to other timelines
export async function refreshEndpoints(timelineEndpoints: TimelineEndpoint[], refreshType: RefreshType): Promise<ArticleIdPair[]> {
	const articleIdPairs = []
	for (const timelineEndpoint of timelineEndpoints)
		if (timelineEndpoint.refreshTypes.has(refreshType) && endpoints[timelineEndpoint.name].refreshTypes.has(refreshType))
			articleIdPairs.push(...endpointRefreshed(timelineEndpoint, await endpoints[timelineEndpoint.name].refresh(refreshType)))

	return articleIdPairs
}

function endpointRefreshed(endpoint: TimelineEndpoint, articles: ArticleWithRefs[]): ArticleIdPair[] {
	if (!articles.length)
		return []
	//TODO Store service name on endpoint
	const service = (articles[0].article.constructor as typeof Article).service

	addArticles(services[service], ...articles)
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