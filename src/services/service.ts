import type Article from '../articles'
import type { ArticleAuthor } from '../articles'
import type { ArticleId, ArticleIdPair, ArticleWithRefs, ArticleProps } from '../articles'
import {articleWithRefToArray, getRootArticle} from '../articles'
import type {Writable} from 'svelte/store'
import {writable} from 'svelte/store'
import {updateCachedArticlesStorage, updateHiddenStorage, updateMarkAsReadStorage} from '../storages/serviceCache'
import type {Endpoint, EndpointConstructorInfo} from './endpoints'
import {undoables} from '../undo'
import type {Filter} from '../filters'
import type {ArticleAction} from './actions'

const services: { [name: string]: Service<any> } = {}

export interface Service<A extends Article = Article> {
	readonly name: string;
	readonly articles: { [id: string]: Writable<A> };
	//TODO Store constructors by name
	readonly endpointConstructors: EndpointConstructorInfo[]
	userEndpoint: ((author: ArticleAuthor) => Endpoint) | undefined,
	articleActions: { [name: string]: ArticleAction<A> };
	requestImageLoad?: (id: ArticleId, index: number) => void;
	getCachedArticles?: () => {[id: string]: object}
	keepArticle(articleWithRefs: ArticleWithRefs | ArticleProps, index: number, filter: Filter): boolean
	defaultFilter(filterType: string): Filter
	filterTypes: { [name: string]: {
			name(inverted: boolean): string
		} }
	sortMethods: { [name: string]: {
		name: string
		compare(a: ArticleWithRefs | ArticleProps, b: ArticleWithRefs | ArticleProps): number
		directionLabel(reversed: boolean): string
	} }
}

export function addArticles(service: Service<any>, ignoreRefs: boolean, ...articlesWithRefs: ArticleWithRefs[]) {
	const articles = ignoreRefs
		? articlesWithRefs.map(getRootArticle)
		: articlesWithRefs.flatMap(articleWithRefToArray)

	for (const article of articles) {
		if (service.articles.hasOwnProperty(article.idPair.id as string)) {
			service.articles[article.idPair.id as string].update(a => {
				a.update(article)
				return a
			})
		}else {
			//https://github.com/microsoft/TypeScript/issues/46395
			service.articles[article.idPair.id as string] = writable(article)
		}
	}

	updateCachedArticlesStorage()
}

export function registerService(service: Service<any>) {
	services[service.name] = service
}

export function getServices(): Readonly<{ [name: string]: Service }> {
	return services
}

export function toggleMarkAsRead(idPair: ArticleIdPair) {
	const store = getWritable(idPair)
	store.update(a => {
		let oldValue = a.markedAsRead
		a.markedAsRead = !a.markedAsRead

		undoables.addCommand({
			undo: () => {
				store.update(a => {
					a.markedAsRead = oldValue
					return a
				})
			},
			redo: () => {
				store.update(a => {
					a.markedAsRead = !oldValue
					return a
				})
			},
			undid: false,
			text: `Article ${idPair.service}/${idPair.id} was marked as ${oldValue ? 'unread' : 'read'}`,
			articleIdPair: idPair,
		})
		return a
	})

	updateMarkAsReadStorage()
}

export function toggleHide(idPair: ArticleIdPair) {
	const store = getWritable(idPair)
	store.update(a => {
		let oldValue = a.hidden
		a.hidden = !a.hidden

		undoables.addCommand({
			undo: () => {
				store.update(a => {
					a.hidden = oldValue
					return a
				})
			},
			redo: () => {
				store.update(a => {
					a.hidden = !oldValue
					return a
				})
			},
			undid: false,
			text: `Article ${idPair.service}/${idPair.id} was ${oldValue ? 'unhidden' : 'hidden'}`,
			articleIdPair: idPair,
		})
		return a
	})

	updateHiddenStorage()
}

export function getWritable<T extends Article = Article>(idPair: ArticleIdPair): Writable<T> {
	//Type casting might not be a great idea, no guarantee that the service returns T
	return services[idPair.service].articles[idPair.id as string] as Writable<T>
}

export async function fetchArticle(idPair: ArticleIdPair) {
	const service = services[idPair.service] as unknown as Service & FetchingService
	if (service.fetchArticle === undefined)
		return

	if (service.fetchedArticles.has(idPair.id))
		return

	if (service.fetchedArticleQueue > 5) {
		if (service.fetchTimeout === undefined) {
			service.fetchTimeout = window.setTimeout(() => {
				service.fetchedArticleQueue = 0
				fetchArticle(idPair)
				//TODO like this, cache only gets update every 5 articles
				updateCachedArticlesStorage()
				service.fetchTimeout = undefined
			}, 1000)
		}
		return
	}
	service.fetchedArticles.add(idPair.id)
	++service.fetchedArticleQueue

	const store = getWritable(idPair)
	await service.fetchArticle(store)
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
		endpointConstructors: [],
		userEndpoint: undefined,
		articleActions: {},
		keepArticle() { return true },
		defaultFilter(filterType: string) { return {type:filterType, service: name}},
		filterTypes: {},
		sortMethods: {},
	}
}

export function newFetchingService<A extends Article = Article>(): Omit<FetchingService<A>, 'fetchArticle'> {
	return {
		fetchedArticles: new Set(),
		fetchedArticleQueue: 0,
		fetchTimeout: undefined,
	}
}