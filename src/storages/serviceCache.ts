import {MAIN_STORAGE_KEY} from './index'
import {get} from 'svelte/store'
import type {Service} from '../services/service'
import {getServices} from '../services/service'

const LOCAL_CACHE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Cache'

type SessionCacheStorage = {
	services: {
		[name: string]: {
			//Storing as strings until we parse bigint, a library could fix it though
			articlesMarkedAsRead: string[],
			cachedArticles: { [id: string]: any }
		}
	}
}

type LocalCacheStorage = {
	services: {
		[name: string]: {
			hiddenArticles: string[],
		}
	}
}

export function updateMarkAsReadStorage() {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY)
	let storage : SessionCacheStorage | null = item !== null ? JSON.parse(item) : null
	if (storage === null)
		storage = {services: {}}

	for (const service of Object.values(getServices())) {
		const articlesMarkedAsRead = Object.values(service.articles)
			.map(a => {
				//TODO Add articlesStore: derived(articles, a => a) to Service
				const value = get(a)
				return value.markedAsRead ? value.idPair.id.toString() : undefined
			})
			.filter(id => id !== undefined) as string[]

		if (storage.services.hasOwnProperty(service.name))
			storage.services[service.name].articlesMarkedAsRead = articlesMarkedAsRead
		else
			storage.services[service.name] = {
				articlesMarkedAsRead,
				cachedArticles: {},
			}
	}

	sessionStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage))
}

export function updateHiddenStorage() {
	const item = localStorage.getItem(LOCAL_CACHE_STORAGE_KEY)
	let storage : LocalCacheStorage | null = item !== null ? JSON.parse(item) : null
	if (storage === null)
		storage = {services: {}}

	for (const service of Object.values(getServices())) {
		const hiddenArticles = Object.values(service.articles)
			.map(a => {
				const article = get(a)
				return article.hidden ? article.idPair.id.toString() : undefined
			})
			.filter(id => id !== undefined) as string[]

		if (storage.services.hasOwnProperty(service.name))
			storage.services[service.name].hiddenArticles = hiddenArticles
		else
			storage.services[service.name] = {
				hiddenArticles,
			}
	}

	localStorage.setItem(LOCAL_CACHE_STORAGE_KEY, JSON.stringify(storage))
}

export function updateCachedArticlesStorage() {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY)
	let storage = item !== null ? JSON.parse(item) : null
	if (storage === null)
		storage = {services: {}}

	for (const service of Object.values(getServices())) {
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

	sessionStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage))
}

//TODO Profile passing service vs service name
export function getMarkedAsReadStorage(service: Service): string[] {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY)
	const parsed: SessionCacheStorage | null = item !== null ? JSON.parse(item) : null
	return parsed?.services[service.name]?.articlesMarkedAsRead || []
}

export function getHiddenStorage(service: Service): string[] {
	const item = localStorage.getItem(LOCAL_CACHE_STORAGE_KEY)
	const parsed: LocalCacheStorage | null = item !== null ? JSON.parse(item) : null
	return parsed?.services[service.name]?.hiddenArticles || []
}

export function getCachedArticlesStorage(service: Service): { [id: string]: object } {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY)
	const parsed = item !== null ? JSON.parse(item) : null
	return parsed?.services[service.name]?.cachedArticles || {}
}