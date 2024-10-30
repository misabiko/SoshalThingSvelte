import {loadMainStorage, MAIN_STORAGE_KEY} from './index';
import {derived, get} from 'svelte/store';
import {getService, type Service} from '~/services/service';
import {getServices} from '~/services/service';
import type Article from '../articles';

// const LOCAL_CACHE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Cache';

type SessionCacheStorage = {
	services: {
		[name: string]: {
			//Storing as strings until we parse bigint, a library could fix it though
			articlesMarkedAsRead: string[]
			cachedArticles: {[id: string]: any}
		}
	}
};

//Might be redundant now that markAsHidden has been removed
// type LocalCacheStorage = {
// 	services: {
// 		[name: string]: {}
// 	}
// }

export function updateMarkAsReadStorage() {
	const {markAsReadLocal} = loadMainStorage();
	const storageType = (markAsReadLocal ? localStorage : sessionStorage);
	const item = storageType.getItem(MAIN_STORAGE_KEY);
	const rawSessionCacheStorage: Partial<SessionCacheStorage> | null = item !== null ? JSON.parse(item) : null;

	const sessionCacheStorage: SessionCacheStorage = rawSessionCacheStorage === null ? {services: {}} : {
		...rawSessionCacheStorage,
		services: rawSessionCacheStorage.services ??{},
	};

	for (const service of Object.values(getServices())) {
		const articlesMarkedAsRead = new Set(sessionCacheStorage.services[service.name]?.articlesMarkedAsRead ?? []);
		for (const article of getServiceArticles(service)) {
			if (article.markedAsRead)
				articlesMarkedAsRead.add(article.idPair.id.toString());
			else
				articlesMarkedAsRead.delete(article.idPair.id.toString());
		}

		if (Object.hasOwn(sessionCacheStorage.services, service.name))
			sessionCacheStorage.services[service.name]!.articlesMarkedAsRead = Array.from(articlesMarkedAsRead);
		else
			sessionCacheStorage.services[service.name] = {
				articlesMarkedAsRead: Array.from(articlesMarkedAsRead),
				cachedArticles: {},
			};
	}

	storageType.setItem(MAIN_STORAGE_KEY, JSON.stringify(sessionCacheStorage));
}

export function updateCachedArticlesStorage(service?: string) {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
	let storage = item !== null ? JSON.parse(item) : null;
	if (storage === null)
		storage = {services: {}};
	else if (storage.services === undefined)
		storage.services = {};

	const services = service !== undefined ? [getService(service)] : Object.values(getServices());

	for (const service of services) {
		const getCachedArticles = service.getCachedArticles;
		if (getCachedArticles !== undefined) {
			const cachedArticles = getCachedArticles();

			if (Object.hasOwn(storage.services, service.name))
				storage.services[service.name].cachedArticles = {
					...storage.services[service.name].cachedArticles,
					...cachedArticles,
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
	const parsed: Partial<SessionCacheStorage> | null = item !== null ? JSON.parse(item) : null;
	if (parsed?.services === undefined)
		return [];

	return parsed.services[service.name]?.articlesMarkedAsRead ?? [];
}

export function getCachedArticlesStorage<S extends object>(service: Service<any>): Record<string, S | undefined> {
	const item = sessionStorage.getItem(MAIN_STORAGE_KEY);
	const parsed = item !== null ? JSON.parse(item) : null;
	if (parsed?.services === undefined)
		return {};
	return parsed.services[service.name]?.cachedArticles || {};
}

function getServiceArticles(service: Service): Article[] {
	return get(derived(Object.values(service.articles).map(([a, _]) => a), (a: Article[]) => a));
}