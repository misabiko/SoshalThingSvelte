import type Article from '~/articles';
import type { ArticleRefIdPair } from '~/articles';
import type { ArticleAuthor } from '~/articles';
import type { ArticleId, ArticleIdPair, ArticleWithRefs, ArticleProps } from '~/articles';
import {articleWithRefToArray, getRootArticle} from '~/articles';
import {get, type Readable, readonly, type Writable} from 'svelte/store';
import {writable} from 'svelte/store';
import {updateCachedArticlesStorage, updateMarkAsReadStorage} from '~/storages/serviceCache';
import type {Endpoint, EndpointConstructorInfo} from './endpoints';
import {undoables} from '~/undo';
import type {Filter, FilterInfo} from '~/filters';
import type {ArticleAction} from './actions';
import {fetchExtension} from './extension';
import type {ComponentType} from 'svelte';

const services: { [name: string]: Service<any> } = {};

export interface Service<A extends Article = Article> {
	readonly name: string;
	readonly articles: Record<string, [Writable<A>, ArticleRefIdPair | null]>;
	readonly endpointConstructors: Record<string, EndpointConstructorInfo>
	userEndpoint: ((author: ArticleAuthor) => Endpoint) | null,
	loadArticle: ((id: string) => Promise<ArticleWithRefs | null>) | null,
	articleActions: { [name: string]: ArticleAction<A> };
	requestImageLoad?: (id: ArticleId, index: number) => void;
	getCachedArticles?: () => {[id: string]: object}
	keepArticle(articleWithRefs: ArticleWithRefs | ArticleProps, index: number, filter: Filter): boolean
	defaultFilter(filterType: string): Filter
	filterTypes: Record<string, FilterInfo>
	sortMethods: Record<string, SortMethodInfo>
	//Might have to move to per-endpoint
	fetchInfo: FetchInfo,
	fetch: (url: RequestInfo | URL, init?: RequestInit) => Promise<any>
	isOnDomain: boolean | null
	settings: ComponentType | null
}

export type FetchInfo =
| {
	type: FetchType.OnDomainOnly
	tabInfo?: never
}
| {
	type: FetchType.Extension
	tabInfo?: never
}
| {
	type: FetchType.Tab
	tabInfo: {
		tabId: Writable<number | null>,
		url: string,
		matchUrl: string[],
	}
}

export enum FetchType {
	OnDomainOnly,
	Extension,
	Tab,
}

export type SortMethodInfo = {
	name: string
	compare(a: ArticleWithRefs | ArticleProps, b: ArticleWithRefs | ArticleProps): number
	directionLabel(reversed: boolean): string
};

export function addArticles(ignoreRefs: boolean, ...articlesWithRefs: ArticleWithRefs[]) {
	const articles = ignoreRefs
		? articlesWithRefs.map(getRootArticle)
		: articlesWithRefs.flatMap(articleWithRefToArray);

	for (const article of articles) {
		//Articles from one service can quote articles from other (TwitterNotifs quotes Tweets)
		const service = services[article.idPair.service];

		if (Object.hasOwn(service.articles, article.idPair.id as string)) {
			service.articles[article.idPair.id as string][0].update(a => {
				a.update(article);
				return a;
			});
		}else {
			//https://github.com/microsoft/TypeScript/issues/46395
			service.articles[article.idPair.id as string] = [writable(article), article.refs];
		}
	}

	updateCachedArticlesStorage();
}

export function registerService(service: Service<any>) {
	services[service.name] = service;
}

//Kinda wack typing
export function registerEndpointConstructor(endpoint: (new (...args: any[]) => Endpoint) & { constructorInfo: EndpointConstructorInfo, service: string }) {
	services[endpoint.service].endpointConstructors[endpoint.constructorInfo.name] = endpoint.constructorInfo;
}

export function getServices(): Readonly<{ [name: string]: Service }> {
	return services;
}

export function toggleMarkAsRead(idPair: ArticleIdPair) {
	const store = getWritable(idPair);
	store.update(a => {
		const oldValue = a.markedAsRead;
		a.markedAsRead = !a.markedAsRead;

		undoables.addCommand({
			undo: () => {
				store.update(a => {
					a.markedAsRead = oldValue;
					return a;
				});
			},
			redo: () => {
				store.update(a => {
					a.markedAsRead = !oldValue;
					return a;
				});
			},
			undid: false,
			text: `Article ${idPair.service}/${idPair.id} was marked as ${oldValue ? 'unread' : 'read'}`,
			articleIdPair: idPair,
		});
		return a;
	});

	updateMarkAsReadStorage();
}

export function getWritable<T extends Article = Article>(idPair: ArticleIdPair): Writable<T> {
	//Type casting might not be a great idea, no guarantee that the service returns T
	return services[idPair.service].articles[idPair.id as string][0] as Writable<T>;
}

export function getReadable<T extends Article = Article>(idPair: ArticleIdPair): Readable<T> {
	return readonly(services[idPair.service].articles[idPair.id as string][0]) as Readable<T>;
}

export async function fetchArticle(idPair: ArticleIdPair) {
	const service = services[idPair.service] as unknown as Service & FetchingService;
	if (service.fetchArticle === undefined)
		return;

	if (service.fetchedArticles.has(idPair.id))
		return;

	if (service.fetchedArticleQueue > 5) {
		if (service.fetchTimeout === undefined) {
			service.fetchTimeout = window.setTimeout(() => {
				service.fetchedArticleQueue = 0;
				fetchArticle(idPair);
				//TODO like this, cache only gets update every 5 articles
				updateCachedArticlesStorage();
				service.fetchTimeout = undefined;
			}, 1000);
		}
		return;
	}
	service.fetchedArticles.add(idPair.id);
	++service.fetchedArticleQueue;

	const store = getWritable(idPair);
	await service.fetchArticle(store);
}

export interface FetchingService<A extends Article = Article> {
	fetchArticle: (store: Writable<A>) => void;
	fetchedArticles: Set<ArticleId>;
	fetchedArticleQueue: number;
	fetchTimeout: undefined | number;
}

export function newService<A extends Article = Article>(name: string): Service<A> {
	return {
		name,
		articles: {},
		endpointConstructors: {},
		userEndpoint: null,
		loadArticle: null,
		articleActions: {},
		keepArticle() { return true; },
		defaultFilter(filterType: string) {
			return {
				type: filterType,
				service: name,
				props: {},
			};
		},
		filterTypes: {},
		sortMethods: {},
		fetchInfo: { type: FetchType.OnDomainOnly },
		async fetch(url, init) {
			if (this.isOnDomain) {
				const response = await fetch(url, init);

				if (init?.headers && (init.headers as Record<string, string>)['Accept'] === 'application/json')
					return await response.json();
				else
					return await response.text();
			}else if (this.fetchInfo.type === FetchType.Extension) {
				const response = await fetchExtension('extensionFetch', {
					soshalthing: true,
					//TODO Use Content-Type to determine fetchJson or fetchText
					// request: 'fetchText',
					fetch: url,
					fetchOptions: init
				});

				if (init?.headers && (init.headers as Record<string, string>)['Accept'] === 'application/json')
					return JSON.parse(response as string);
				else
					return response;
			}else if (this.fetchInfo.type === FetchType.Tab) {
				let tabId = get(this.fetchInfo.tabInfo.tabId);
				if (tabId === null) {
					this.fetchInfo.tabInfo.tabId.set(tabId = await fetchExtension('getTabId', {
						url: this.fetchInfo.tabInfo.url,
						matchUrl: this.fetchInfo.tabInfo.matchUrl
					}));
				}

				return await fetchExtension('domainFetch', {
					tabId,
					message: {
						soshalthing: true,
						request: 'fetchText',
						fetch: url,
						fetchOptions: init
					}
				});
			}else {
				throw new Error('Service is not on domain and has no tab info');
			}
		},
		isOnDomain: null,
		settings: null,
	};
}

export function newFetchingService<A extends Article = Article>(): Omit<FetchingService<A>, 'fetchArticle'> {
	return {
		fetchedArticles: new Set(),
		fetchedArticleQueue: 0,
		fetchTimeout: undefined,
	};
}