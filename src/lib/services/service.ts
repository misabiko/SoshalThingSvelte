import type Article from './article'
import type {Writable} from 'svelte/store'
import {get, writable} from 'svelte/store'

const endpoints: { [name: string]: Endpoint } = {}
const services: { [name: string]: Service } = {}
const endpointConstructors: { [service: string]: EndpointConstructorInfo[] } = {}

export interface Service {
	readonly name: string;
	readonly articles: { [id: string | number]: Writable<Article> };
	articleActions: { [name: string]: ArticleAction };
	requestImageLoad?: (id: string | number, index: number) => void;
}

type ArticleAction = {
	action: (idPair: ArticleIdPair) => void;
	togglable: boolean;
};

export type ArticleIdPair = {
	service: string;
	id: string | number
};

export function addArticles(service: Service, ...articles: Article[]): { idPair: ArticleIdPair, store: Writable<Article> }[] {
	const readables = []
	for (const article of articles) {
		const store = service.articles[article.id] = writable(article)
		readables.push({idPair: {service: service.name, id: article.id}, store})
	}

	return readables
}

export abstract class Endpoint {
	readonly name: string
	readonly articleIdPairs: ArticleIdPair[] = []

	static readonly constructorInfo: EndpointConstructorInfo

	abstract refresh(refreshTime: RefreshTime): Promise<Article[]>;

	async loadTop(refreshTime: RefreshTime): Promise<Article[]> {
		console.debug(`${this.name} doesn't implement loadTop()`)
		return await this.refresh(refreshTime)
	}

	async loadBottom(refreshTime: RefreshTime): Promise<Article[]> {
		console.debug(`${this.name} doesn't implement loadBottom()`)
		return await this.refresh(refreshTime)
	}
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

export function registerService(service: Service, constructors: EndpointConstructorInfo[]) {
	services[service.name] = service
	endpointConstructors[service.name] = constructors
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
	const key = 'SoshalThingSvelte'
	let storage = JSON.parse(sessionStorage.getItem(key))
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

	sessionStorage.setItem('SoshalThingSvelte', JSON.stringify(storage))
}

//TODO Profile passing service vs service name
export function getMarkedAsReadStorage(service: Service): (string | number)[] {
	return JSON.parse(sessionStorage.getItem('SoshalThingSvelte'))?.services[service.name]?.articlesMarkedAsRead || []
}

export function articleAction(action: string, idPair: ArticleIdPair) {
	if (services[idPair.service].articleActions.hasOwnProperty(action))
		services[idPair.service].articleActions[action].action(idPair)
	else
		console.warn(`${idPair.service} doesn't have action ${action}.`)
}

export function addEndpoint(endpoint: Endpoint) {
	if (endpoints.hasOwnProperty(endpoint.name))
		console.warn(`Endpoint ${endpoint.name} already exists`);
	else
		endpoints[endpoint.name] = endpoint;
}

export async function refreshEndpoints(endpointNames: string[], refreshTime: RefreshTime): Promise<ArticleIdPair[]> {
	return endpointRefreshed(endpointNames[0], await endpoints[endpointNames[0]].refresh(refreshTime));
}

export async function loadTopEndpoints(endpointNames: string[], refreshTime: RefreshTime): Promise<ArticleIdPair[]> {
	return endpointRefreshed(endpointNames[0], await endpoints[endpointNames[0]].loadTop(refreshTime));
}

export async function loadBottomEndpoints(endpointNames: string[], refreshTime: RefreshTime): Promise<ArticleIdPair[]> {
	return endpointRefreshed(endpointNames[0], await endpoints[endpointNames[0]].loadBottom(refreshTime));
}

function endpointRefreshed(endpointName: string, articles: Article[]): ArticleIdPair[] {
	if (!articles.length)
		return [];
	//TODO Store service name on endpoint
	// @ts-ignore
	const service = articles[0].constructor.service;

	return addArticles(services[service], ...articles).map(({idPair}) => idPair)
		.filter(idPair => {
			if (endpoints[endpointName].articleIdPairs.findIndex(pair => pair.service === idPair.service && pair.id === idPair.id) === -1) {
				endpoints[endpointName].articleIdPairs.push(idPair)
				return true;
			}else
				return false
		});
}