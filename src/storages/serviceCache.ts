import {loadMainStorage, MAIN_STORAGE_KEY} from './index';
import {derived, get} from 'svelte/store';
import type {Service} from '../services/service';
import {getServices} from '../services/service';
import type Article from '../articles';

const LOCAL_CACHE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Cache';

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
	const {markAsReadLocal} = loadMainStorage();
	const storageType = (markAsReadLocal ? localStorage : sessionStorage);
	const item = storageType.getItem(MAIN_STORAGE_KEY);
	let storage : SessionCacheStorage | null = item !== null ? JSON.parse(item) : null;
	if (storage === null)
		storage = {services: {}};
	else if (storage.services === undefined)
		storage.services = {};

	for (const service of Object.values(getServices())) {
		const articlesMarkedAsRead = new Set(storage.services[service.name]?.articlesMarkedAsRead);
		for (const article of getServiceArticles(service)) {
			if (article.markedAsRead)
				articlesMarkedAsRead.add(article.idPair.id.toString());
			else
				articlesMarkedAsRead.delete(article.idPair.id.toString());
		}

		if (Object.hasOwn(storage.services, service.name))
			storage.services[service.name].articlesMarkedAsRead = [...articlesMarkedAsRead];
		else
			storage.services[service.name] = {
				articlesMarkedAsRead: [...articlesMarkedAsRead],
				cachedArticles: {},
			};
	}

	storageType.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage));
}

export function updateHiddenStorage() {
	const item = localStorage.getItem(LOCAL_CACHE_STORAGE_KEY);
	let storage : LocalCacheStorage | null = item !== null ? JSON.parse(item) : null;
	if (storage === null)
		storage = {services: {}};
	else if (storage.services === undefined)
		storage.services = {};

	for (const service of Object.values(getServices())) {
		const hiddenArticles = new Set(storage.services[service.name]?.hiddenArticles || []);
		for (const article of getServiceArticles(service)) {
			if (article.hidden)
				hiddenArticles.add(article.idPair.id.toString());
			else
				hiddenArticles.delete(article.idPair.id.toString());
		}

		if (Object.hasOwn(storage.services, service.name))
			storage.services[service.name].hiddenArticles = [...hiddenArticles];
		else
			storage.services[service.name] = {
				hiddenArticles:  [...hiddenArticles],
			};
	}

	localStorage.setItem(LOCAL_CACHE_STORAGE_KEY, JSON.stringify(storage));
}

export function updateCachedArticlesStorage() {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
	let storage = item !== null ? JSON.parse(item) : null;
	if (storage === null)
		storage = {services: {}};
	else if (storage.services === undefined)
		storage.services = {};

	for (const service of Object.values(getServices())) {
		const getCachedArticles = service.getCachedArticles;
		if (getCachedArticles !== undefined) {
			const cachedArticles = getCachedArticles();

			if (Object.hasOwn(storage.services, service.name))
				storage.services[service.name].cachedArticles = {
					...storage.services[service.name].cachedArticles,
					...cachedArticles
				};
			else
				storage.services[service.name] = {
					articlesMarkedAsRead: [],
					cachedArticles,
				};
		}
	}

	sessionStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage));
}

export function getMarkedAsReadStorage(service: Service<any>): string[] {
	const {markAsReadLocal} = loadMainStorage();
	const item = (markAsReadLocal ? localStorage : sessionStorage).getItem(MAIN_STORAGE_KEY);
	const parsed: SessionCacheStorage | null = item !== null ? JSON.parse(item) : null;
	if (parsed?.services === undefined)
		return [];
	return parsed.services[service.name]?.articlesMarkedAsRead || [];
}

export function getHiddenStorage(service: Service<any>): string[] {
	const item = localStorage.getItem(LOCAL_CACHE_STORAGE_KEY);
	const parsed: LocalCacheStorage | null = item !== null ? JSON.parse(item) : null;
	if (parsed?.services === undefined)
		return [];
	return parsed.services[service.name]?.hiddenArticles || [];
}

export function getCachedArticlesStorage(service: Service<any>): { [id: string]: object } {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
	const parsed = item !== null ? JSON.parse(item) : null;
	if (parsed?.services === undefined)
		return {};
	return parsed.services[service.name]?.cachedArticles || {};
}

function getServiceArticles(service: Service): Article[] {
	return get(derived(Object.values(service.articles), (a: Article) => a));
}