import type Article from './article'
import type {Writable} from 'svelte/store'
import {get, writable} from 'svelte/store'
import {TwitterService} from './twitter/service'

const endpoints: Endpoint[] = []
const services: { [name: string]: Service } = {}
const endpointConstructors: EndpointConstructorInfo[] = []

export interface Service {
	readonly name: string;
	readonly articles: { [id: string | number]: Writable<Article> };
	requestImageLoad?: (id: string | number, index: number) => void;
}

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
	readonly articleIds: string[]

	static readonly constructorInfo: EndpointConstructorInfo

	addArticles(ids: string[]) {
		for (const id of ids) {
			if (!this.articleIds.includes(id))
				this.articleIds.push(id)
		}
	}

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
	endpointConstructors.push(...constructors)
}

export function toggleMarkAsRead(idPair: ArticleIdPair) {
	getWritable(idPair).update(a => {
		a.markedAsRead = !a.markedAsRead
		return a
	});

	updateMarkAsReadStorage();
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

export type ArticleIdPair = {
	service: string;
	id: string | number
};

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
			.filter(id => id !== undefined);

		if (storage.services.hasOwnProperty(service.name))
			storage.services[service.name].articlesMarkedAsRead = articlesMarkedAsRead;
		else
			storage.services[service.name] = {
				articlesMarkedAsRead,
				cachedArticles: {}
			}
	}

	sessionStorage.setItem('SoshalThingSvelte', JSON.stringify(storage));
}

export function getMarkedAsReadStorage(service: Service): (string | number)[] {
	return JSON.parse(sessionStorage.getItem('SoshalThingSvelte'))?.services[service.name]?.articlesMarkedAsRead || [];
}