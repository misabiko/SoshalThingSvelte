import type Article from './article';
import type {Readable} from 'svelte/store'
import {readable} from 'svelte/store'

export interface Service {
	readonly name: string;
	//TODO readonly articles: {[id: string | number]: [Article, Readable<Article>]};
	readonly articles: {[id: string | number]: { article: Article, store: Readable<Article> }};
	requestImageLoad?: (id: string | number, index: number) => void;
}

export function addArticles(service: Service, ...articles: Article[]): Readable<Article>[] {
	const readables: Readable<Article>[] = [];
	for (const article of articles) {
		const obj = {
			article,
			store: readable(article),
		}
		readables.push(obj.store);
		service.articles[article.id] = obj;
	}

	return readables;
}

export abstract class Endpoint {
	readonly name: string;
	readonly articleIds: string[];

	static readonly constructorInfo: EndpointConstructorInfo;

	addArticles(ids: string[]) {
		for (const id of ids) {
			if (!this.articleIds.includes(id))
				this.articleIds.push(id);
		}
	}

	abstract refresh(refreshTime: RefreshTime): Promise<Article[]>;

	async loadTop(refreshTime: RefreshTime): Promise<Article[]> {
		console.debug(`${this.name} doesn't implement loadTop()`);
		return await this.refresh(refreshTime);
	}

	async loadBottom(refreshTime: RefreshTime): Promise<Article[]> {
		console.debug(`${this.name} doesn't implement loadBottom()`);
		return await this.refresh(refreshTime);
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

const endpoints: Endpoint[] = [];
const services: Service[] = [];
const endpointConstructors: EndpointConstructorInfo[] = [];

export function registerService(service: Service, constructors: EndpointConstructorInfo[]) {
	services.push(service);
	endpointConstructors.push(...constructors);
}
