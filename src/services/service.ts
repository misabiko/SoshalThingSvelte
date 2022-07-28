import type Article from './article'
import type { ArticleId, ArticleIdPair, ArticleWithRefs } from './article'
import {getRefed} from './article'
import type {Writable} from 'svelte/store'
import {writable} from 'svelte/store'
import {updateCachedArticlesStorage, updateHiddenStorage, updateMarkAsReadStorage} from '../storages/serviceCache'
import type {EndpointConstructorInfo} from './endpoints'
import type {Endpoint} from './endpoints'
import {undoables} from '../undo'

const services: { [name: string]: Service } = {}

export interface Service<A extends Article = Article> {
	readonly name: string;
	readonly articles: { [id: string]: Writable<A> };
	//TODO Store constructors by name
	readonly endpointConstructors: EndpointConstructorInfo[]
	userEndpoint: ((username: string) => Endpoint) | undefined,
	articleActions: { [name: string]: ArticleAction };
	requestImageLoad?: (id: ArticleId, index: number) => void;
	getCachedArticles?: () => {[id: string]: object}
}

type ArticleAction = {
	action: (idPair: ArticleIdPair) => void;
	togglable: boolean;
};

export const STANDARD_ACTIONS = {
	like: 'like',
	repost: 'repost',
	markAsRead: 'markAsRead',
	hide: 'hide',
};

export function articleAction(action: string, idPair: ArticleIdPair) {
	switch (action) {
		case STANDARD_ACTIONS.markAsRead:
			toggleMarkAsRead(idPair)
			break;
		case STANDARD_ACTIONS.hide:
			toggleHide(idPair)
			break;
		default:
			if (services[idPair.service].articleActions.hasOwnProperty(action))
				services[idPair.service].articleActions[action].action(idPair)
			else
				console.warn(`${idPair.service} doesn't have action ${action}.`)
	}
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

export function registerService(service: Service) {
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
			text: `Article ${idPair.service}/${idPair.id} was marked as ${oldValue ? 'unread' : 'read'}`
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
			text: `Article ${idPair.service}/${idPair.id} was ${oldValue ? 'unhidden' : 'hidden'}`
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