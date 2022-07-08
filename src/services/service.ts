import type {ArticleIdPair, ArticleRef} from './article'
import type Article from './article'
import type {Writable} from 'svelte/store'
import {get, writable} from 'svelte/store'
import {getRefed} from './article'

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
	favorite: 'favorite',
	repost: 'repost',
};

export function articleAction(action: string, idPair: ArticleIdPair) {
	if (services[idPair.service].articleActions.hasOwnProperty(action))
		services[idPair.service].articleActions[action].action(idPair)
	else
		console.warn(`${idPair.service} doesn't have action ${action}.`)
}

export function addArticles(service: Service, ...articles: ArticleWithRefs[]): ArticleIdPair[] {
	const idPairs = []
	for (const {article, refs} of articles) {
		service.articles[article.id] = writable(article)
		idPairs.push({service: service.name, id: article.id})
		for (const ref of refs.flatMap(getRefed) as Article[]) {
			service.articles[ref.id] = writable(ref)
		}
	}

	updateCachedArticlesStorage()
	return idPairs
}

export abstract class Endpoint {
	abstract readonly name: string
	readonly articleIdPairs: ArticleIdPair[] = []

	static readonly constructorInfo: EndpointConstructorInfo

	abstract refresh(refreshTime: RefreshTime): Promise<ArticleWithRefs[]>;

	async loadTop(refreshTime: RefreshTime): Promise<ArticleWithRefs[]> {
		console.debug(`${this.name} doesn't implement loadTop()`)
		return await this.refresh(refreshTime)
	}

	async loadBottom(refreshTime: RefreshTime): Promise<ArticleWithRefs[]> {
		console.debug(`${this.name} doesn't implement loadBottom()`)
		return await this.refresh(refreshTime)
	}
}

export type ArticleWithRefs = {
	article: Article,
	refs: ArticleRef[],
	actualArticleIndex?: number,
}

interface EndpointConstructorInfo {
	readonly name: string;
	readonly paramTemplate: [string, ParamType][];
	readonly constructor: (params: EndpointConstructorParams) => Endpoint;
}

export type EndpointConstructorParams = { [param: string]: ParamType };

export enum RefreshTime {
	OnStart,
	OnRefresh,
}

type ParamType = string | number | boolean;

export function registerService(service: Service) {
	services[service.name] = service
}

export function registerEndpoint(service: Service, ...endpointInfos: EndpointConstructorInfo[]) {
	endpointConstructors[service.name] ??= []
	endpointConstructors[service.name].push(...endpointInfos)
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

export function getWritable(idPair: ArticleIdPair) {
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
				return value.markedAsRead ? value.id : undefined
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

export function addEndpoint(endpoint: Endpoint) {
	if (endpoints.hasOwnProperty(endpoint.name))
		console.warn(`Endpoint ${endpoint.name} already exists`)
	else
		endpoints[endpoint.name] = endpoint
}

export async function refreshEndpoints(endpointNames: string[], refreshTime: RefreshTime): Promise<ArticleIdPair[]> {
	return endpointRefreshed(endpointNames[0], await endpoints[endpointNames[0]].refresh(refreshTime))
}

export async function loadTopEndpoints(endpointNames: string[], refreshTime: RefreshTime): Promise<ArticleIdPair[]> {
	return endpointRefreshed(endpointNames[0], await endpoints[endpointNames[0]].loadTop(refreshTime))
}

export async function loadBottomEndpoints(endpointNames: string[], refreshTime: RefreshTime): Promise<ArticleIdPair[]> {
	return endpointRefreshed(endpointNames[0], await endpoints[endpointNames[0]].loadBottom(refreshTime))
}

function endpointRefreshed(endpointName: string, articles: ArticleWithRefs[]): ArticleIdPair[] {
	if (!articles.length)
		return []
	//TODO Store service name on endpoint
	// @ts-ignore
	const service = articles[0].article.constructor.service

	return addArticles(services[service], ...articles)
		.filter(idPair => {
			if (endpoints[endpointName].articleIdPairs.findIndex(pair => pair.service === idPair.service && pair.id === idPair.id) === -1) {
				endpoints[endpointName].articleIdPairs.push(idPair)
				return true
			}else
				return false
		})
}

export function fetchArticle(idPair: ArticleIdPair) {
	const service = services[idPair.service]
	const fetchArticle = service.fetchArticle
	if (fetchArticle !== undefined)
		fetchArticle(idPair.id);
}