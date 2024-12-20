import {
	defaultTimelineViewId,
	type FullscreenInfo,
	type TimelineCollection,
	type TimelineEndpoint,
	type TimelineView,
} from '~/timelines';
import type {Component} from 'svelte';
import ColumnContainer from '~/containers/ColumnContainer.svelte';
import RowContainer from '~/containers/RowContainer.svelte';
import MasonryContainer from '~/containers/MasonryContainer.svelte';
import SocialArticleView from '~/articles/social/SocialArticleView.svelte';
import GalleryArticleView from '~/articles/gallery/GalleryArticleView.svelte';
import {getService, getServices} from '~/services/service';
import {defaultFilterInstances, type FilterInstance, genericFilterTypes} from '~/filters';
import type {SortInfo} from '~/sorting';
import {SortMethod} from '~/sorting';
import {defaultTimeline} from '~/timelines';
import {
	addEndpoint,
	Endpoint,
	endpoints,
	RefreshType,
	startAutoRefresh,
} from '~/services/endpoints';
import type {EndpointConstructorParams} from '~/services/endpoints';
import {derived, get} from 'svelte/store';
import type {ArticleViewProps} from '~/articles';
import type {ActualContainerProps} from '~/containers';

export const MAIN_STORAGE_KEY = 'SoshalThingSvelte';
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines';

type RawMainStorage = Partial<MainStorageParsed & {
	currentTimelineViewId: string
	timelineViews: {[name: string]: TimelineViewStorage}
	fullscreen: boolean | number | FullscreenInfoStorage
}>;

export function loadMainStorage(): MainStorageParsed {
	const item = localStorage.getItem(MAIN_STORAGE_KEY);
	const partialMainStorage: RawMainStorage = item ? JSON.parse(item) : {};

	const timelineIds = partialMainStorage.timelineIds ?? null;

	const currentTimelineView = partialMainStorage.currentTimelineViewId ?? null;

	const timelineViews: Record<string, TimelineView> = {};
	if (partialMainStorage.timelineViews) {
		for (const view in partialMainStorage.timelineViews)
			if (Object.hasOwn(partialMainStorage.timelineViews, view))
				timelineViews[view] = {
					timelineIds: partialMainStorage.timelineViews[view]!.timelineIds,
					fullscreen: parseFullscreenInfo(partialMainStorage.timelineViews[view]!.fullscreen),
				};
	}

	const fullscreen = parseFullscreenInfo(partialMainStorage.fullscreen);

	const maximized = partialMainStorage.maximized ?? false;

	const markAsReadLocal = partialMainStorage.markAsReadLocal ?? false;

	const useWebSocket = partialMainStorage.useWebSocket ?? false;

	return {
		timelineIds,
		currentTimelineViewId: currentTimelineView,
		timelineViews,
		fullscreen,
		maximized,
		markAsReadLocal,
		//TODO Add UI setting for websocket
		useWebSocket,
	};
}

type ServiceStorage = Record<string, any>;

//TODO Type storage per service
export function getServiceStorage(service: string): ServiceStorage {
	const storageKey = `${MAIN_STORAGE_KEY} ${service}`;
	const item = localStorage.getItem(storageKey);
	return item ? JSON.parse(item) : {};
}

export function getServiceStorageCallback<V>(service: string, callback: (storage: ServiceStorage) => V) {
	return callback(getServiceStorage(service));
}

export function updateServiceStorageCallback(service: string, callback: (storage: ServiceStorage) => ServiceStorage) {
	const storageKey = `${MAIN_STORAGE_KEY} ${service}`;
	const item = localStorage.getItem(storageKey);
	const storage = item ? JSON.parse(item) : {};

	callback(storage);

	localStorage.setItem(storageKey, JSON.stringify(storage));
}

export function updateServiceStorage<V>(service: string, key: string, updater: (oldValue: V) => V) {
	updateServiceStorageCallback(service, storage => {
		const value = updater(storage[key]);
		if (value === undefined)
			delete storage[key];
		else
			storage[key] = value;

		return storage;
	});
}

export function setServiceStorage(service: string, key: string, value: any) {
	updateServiceStorage(service, key, () => value);
}

export function updateMainStorage(key: string, value: any) {
	const item = localStorage.getItem(MAIN_STORAGE_KEY);
	const storage = item ? JSON.parse(item) : {};
	storage[key] = value;

	localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage));
}

export function updateMainStorageTimelineViews(views: Record<string, TimelineView>) {
	const item = localStorage.getItem(MAIN_STORAGE_KEY);
	const storage = item ? JSON.parse(item) : {};

	if (views[defaultTimelineViewId] === undefined)
		throw new Error('Default timeline view must exist');

	views.default = views[defaultTimelineViewId];
	storage.timelineViews = views;

	localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage));
}

export function updateMaximized(maximized: boolean) {
	updateMainStorage('maximized', maximized);
}

export function updateFullscreenStorage(fullscreen: FullscreenInfo) {
	const stringified: any = {...fullscreen};
	if (stringified.container)
		stringified.container = stringified.container.name;

	updateMainStorage('fullscreen', stringified);
}

export function loadTimelines(): TimelineCollection {
	const item = localStorage.getItem(TIMELINE_STORAGE_KEY);
	let storage: {[id: string]: Partial<TimelineStorage>} = item ? JSON.parse(item) : {};
	if (storage instanceof Array) {
		console.warn('SoshalThingSvelte Timelines should be an object {[id: string]: TimelineStorage}');
		storage = Object.assign({}, storage);
	}

	return Object.fromEntries(Object.entries(storage).map(([id, t]) => {
		const defaulted: TimelineStorage = {
			...({
				title: 'Timeline',
				endpoints: [],
				filters: defaultFilterInstances,
				sortInfo: {
					method: null,
					reversed: false,
				},
			}),
			...t,
		};

		const endpoints: TimelineEndpoint[] = [];
		for (const endpointStorage of defaulted.endpoints) {
			const endpoint = parseAndLoadEndpoint(endpointStorage);
			if (endpoint !== undefined && !endpoints.find(e => e.name === endpoint.name))
				endpoints.push(endpoint);
		}

		defaulted.filters = parseFilters(defaulted.filters/* ?? []*/);

		//TODO Try to avoid defaulted, while passing tests
		const timeline = defaultTimeline({
			title: defaulted.title,
			endpoints,
			section: defaulted.section ?? {
				useSection: false,
				count: 100,
			},
			container: parseContainer(defaulted.container),
			articleView: parseArticleView(defaulted.articleView),
			columnCount: defaulted.columnCount ?? 1,
			rtl: defaulted.rtl ?? false,
			width: defaulted.width ?? 1,
			filters: defaulted.filters,
			sortInfo: parseSortInfo(defaulted.sortInfo),
			animatedAsGifs: defaulted.animatedAsGifs ?? false,
			muteVideos: defaulted.muteVideos ?? false,
			scrollSpeed: defaulted.scrollSpeed ?? 3,
			hideText: defaulted.hideText ?? false,
			compact: defaulted.compact ?? false,
			fullMedia: defaulted.fullMedia ?? 0,
			hideQuoteMedia: defaulted.hideQuoteMedia ?? false,
			shouldLoadMedia: defaulted.shouldLoadMedia ?? true,
			hideFilteredOutArticles: defaulted.hideFilteredOutArticles ?? true,
			mergeReposts: defaulted.mergeReposts ?? true,
			showArticleCount: defaulted.showArticleCount ?? false,
			maxMediaCount: defaulted.maxMediaCount ?? 4,
			separateMedia: defaulted.separateMedia ?? false,
		});

		return [id, timeline];
	}));
}

export function updateTimelinesStorage(timelines: TimelineCollection) {
	//TODO Remove already default optional fields
	const storage: Record<string, Partial<TimelineStorage>> = Object.fromEntries(Object.entries(timelines).map(([id, t]) => [id, {
		title: t.title,
		container: t.container.name,
		articleView: t.articleView.name,
		endpoints: endpointsToStorage(t.endpoints),
		columnCount: t.columnCount,
		width: t.width,
		filters: get(t.filters),
		sortInfo: sortInfoToStorage(t.sortInfo),
		compact: t.compact,
		fullMedia: t.fullMedia,
		hideQuoteMedia: t.hideQuoteMedia,
		animatedAsGifs: t.animatedAsGifs,
		muteVideos: t.muteVideos,
		hideText: t.hideText,
		section: t.section,
	} satisfies Partial<TimelineStorage>]));

	localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(storage));
}

export function updateTimelinesStorageValue<K extends keyof TimelineStorage>(timelineId: string, key: K, value: TimelineStorage[K]) {
	const storageStr = localStorage.getItem(TIMELINE_STORAGE_KEY);
	const storage = storageStr ? JSON.parse(storageStr) : {};
	storage[timelineId] ??= {};
	storage[timelineId][key] = value;

	localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(storage));
}

export function updateServiceTemplateStorageValue<K extends keyof TimelineStorage>(service: string, templateId: string, key: K, value: TimelineStorage[K]) {
	updateServiceStorage(service, 'timelineTemplates', (templates: any) => {
		templates ??= {};
		templates[templateId] ??= {};

		if (value === undefined)
			delete templates[templateId][key];
		else
			templates[templateId][key] = value;

		return templates;
	});
}

export function updateTimelinesStorageEndpoints(timelineId: string, endpoints: TimelineEndpoint[]) {
	updateTimelinesStorageValue(timelineId, 'endpoints', endpointsToStorage(endpoints));
}

export function updateTimelinesStorageSortInfo(timelineId: string, sortInfo: SortInfo) {
	updateTimelinesStorageValue(timelineId, 'sortInfo', sortInfoToStorage(sortInfo));
}

//maybe would fit better in a utils file
//https://stackoverflow.com/a/21125098/2692695
export function getCookie(name: string): string | null {
	const regex = new RegExp(`(^| )${name}=([^;]+)`);
	const match = document.cookie.match(regex);
	if (match) {
		if (match[2])
			return match[2];
		else
			throw new Error('Empty cookie value');
	}else
		return null;
}

function parseContainer(container: string | undefined): Component<ActualContainerProps> {
	switch (container) {
		case 'Row':
		case 'RowContainer':
			return RowContainer;
		case 'Masonry':
		case 'MasonryContainer':
			return MasonryContainer;
		case 'Column':
		case 'ColumnContainer':
		default:
			return ColumnContainer;
	}
}

function parseArticleView(articleView: string | undefined): Component<ArticleViewProps> {
	switch (articleView) {
		case 'Gallery':
		case 'GalleryArticle':
		case 'GalleryArticleView':
			return GalleryArticleView;
		case 'Social':
		case 'SocialArticle':
		case 'SocialArticleView':
		default:
			return SocialArticleView;
	}
}

function parseAndLoadEndpoint(storage: EndpointStorage): TimelineEndpoint | undefined {
	const endpointsValue: Endpoint[] = get(derived(Object.values(endpoints), (e: Endpoint[]) => e));
	if (!Object.hasOwn(getServices(), storage.service)) {
		console.error(`"${storage.service}" isn't a registered service`);
		return undefined;
	}else if (!Object.hasOwn(getService(storage.service).endpointConstructors, storage.endpointType)) {
		console.error(`"${storage.service}" doesn't have endpointType "${storage.endpointType}"`);
		return undefined;
	}

	const constructorInfo = getService(storage.service).endpointConstructors[storage.endpointType];
	if (constructorInfo === undefined)
		throw new Error(`Endpoint constructor "${storage.endpointType}" not found`);

	let endpoint = endpointsValue.find(endpoint =>
		constructorInfo.name === (endpoint.constructor as typeof Endpoint).constructorInfo.name &&
		endpoint.matchParams(storage.params),
	);

	if (endpoint === undefined) {
		if (storage.params === undefined)
			storage.params = {};

		for (const [param, defaultValue] of constructorInfo.paramTemplate)
			if (!Object.hasOwn(storage.params, param))
				storage.params[param] = defaultValue;

		endpoint = constructorInfo.constructor(storage.params);
		addEndpoint(endpoint);
	}

	const refreshTypes = new Set<RefreshType>();
	if (storage.onStart ?? true)
		refreshTypes.add(RefreshType.RefreshStart);
	if (storage.onRefresh ?? true)
		refreshTypes.add(RefreshType.Refresh);
	if (storage.loadTop ?? true)
		refreshTypes.add(RefreshType.LoadTop);
	if (storage.loadBottom ?? true)
		refreshTypes.add(RefreshType.LoadBottom);

	if (storage.autoRefresh)
		startAutoRefresh(endpoint.name);

	storage.filters = parseFilters(storage.filters ?? []);

	return {
		name: endpoint.name,
		refreshTypes,
		filters: storage.filters ?? [],
	};
}

function endpointsToStorage(timelineEndpoints: TimelineEndpoint[]): EndpointStorage[] {
	return timelineEndpoints
		.map(e => {
			let endpoint = e.endpoint;
			if (endpoint == null) {
				if (!e.name)
					throw new Error('Endpoint name is required');
				const registered = endpoints[e.name];
				if (registered == null)
					throw new Error(`Endpoint "${e.name}" not found`);
				endpoint = get(registered);
			}
			return {
				endpoint,
				filters: e.filters,
				refreshTypes: e.refreshTypes,
			};
		})
		.map(({endpoint, filters, refreshTypes}) => ({
			service: (endpoint.constructor as typeof Endpoint).service,
			endpointType: (endpoint.constructor as typeof Endpoint).constructorInfo.name,
			params: endpoint.params ?? undefined,
			filters,
			autoRefresh: endpoint.autoRefreshId !== null,
			onStart: refreshTypes.has(RefreshType.RefreshStart),
			onRefresh: refreshTypes.has(RefreshType.Refresh),
			loadTop: refreshTypes.has(RefreshType.LoadTop),
			loadBottom: refreshTypes.has(RefreshType.LoadBottom),
		}));
}

function parseSortInfo(storage: TimelineStorage['sortInfo']): SortInfo {
	const reversed = storage.reversed || false;

	if (storage.customMethod) {
		return {
			method: SortMethod.Custom,
			customMethod: storage.customMethod,
			reversed,
		};
	}else {
		let method: SortMethod | null = null;
		switch (storage.method?.toLowerCase()) {
			case 'id':
				method = SortMethod.Id;
				break;
			case 'date':
				method = SortMethod.Date;
				break;
		}

		return {
			method,
			customMethod: null,
			reversed,
		};
	}
}

function sortInfoToStorage(sortInfo: SortInfo): TimelineStorage['sortInfo'] {
	if (sortInfo.customMethod) {
		return {
			customMethod: sortInfo.customMethod,
			reversed: sortInfo.reversed,
		};
	}else {
		let method: string | null = null;
		switch (sortInfo.method) {
			case SortMethod.Id:
				method = 'Id';
				break;
			case SortMethod.Date:
				method = 'Date';
				break;
		}

		return {
			method,
			reversed: sortInfo.reversed,
		};
	}
}

function parseFilters(storageFilters: FilterInstance[]) {
	const filters: FilterInstance[] = [];

	for (const instance of storageFilters) {
		instance.filter.service ??= null;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		instance.filter.props ??= {};

		if (instance.filter.service === null && !Object.hasOwn(genericFilterTypes, instance.filter.type))
			console.error(`Generic filter "${instance.filter.type}" doesn't exist.`, instance);
		else if (instance.filter.service !== null && !Object.hasOwn(getServices(), instance.filter.service))
			console.error(`Service ${instance.filter.service} isn't registered.`, instance);
		else if (instance.filter.service !== null && !Object.hasOwn(getService(instance.filter.service).filterTypes, instance.filter.type))
			console.error(`Service "${instance.filter.service}" doesn't have filter "${instance.filter.type}".`, instance);
		else
			filters.push(instance);
	}

	return filters;
}

function parseFullscreenInfo(fullscreenInfoStorage?: boolean | number | FullscreenInfoStorage): FullscreenInfo {
	if (typeof fullscreenInfoStorage === 'object')
		return {
			index: fullscreenInfoStorage.index ?? null,
			columnCount: fullscreenInfoStorage.columnCount ?? null,
			container: fullscreenInfoStorage.container ? parseContainer(fullscreenInfoStorage.container) : null,
		};
	else if (fullscreenInfoStorage === true)
		return {
			index: 0,
			columnCount: null,
			container: null,
		};
	else if (typeof fullscreenInfoStorage === 'number')
		return {
			index: fullscreenInfoStorage,
			columnCount: null,
			container: null,
		};
	else
		return {
			index: null,
			columnCount: null,
			container: null,
		};
}

type MainStorageParsed = {
	timelineIds: TimelineView['timelineIds'] | null
	currentTimelineViewId: string | null
	timelineViews: Record<string, TimelineView>
	fullscreen: FullscreenInfo
	maximized: boolean
	markAsReadLocal: boolean
	//TODO Add UI setting for websocket
	useWebSocket: boolean
};

type FullscreenInfoStorage = FullscreenInfo & {
	container: string | null
};

type TimelineViewStorage = TimelineView & {
	fullscreen: FullscreenInfoStorage
};

type TimelineStorage = {
	title: string
	endpoints: EndpointStorage[]
	section?: {
		useSection: boolean
		count: number
	}
	container?: string
	articleView?: string
	columnCount?: number
	rtl?: boolean
	width?: number
	filters: FilterInstance[]
	sortInfo: {
		method: string | null
		customMethod?: never
		reversed: boolean
	} | {
		method?: never
		customMethod: {
			service: string
			method: string
		}
		reversed: boolean
	}
	animatedAsGifs?: boolean
	muteVideos?: boolean
	scrollSpeed?: number
	hideText?: boolean
	compact?: boolean
	fullMedia?: number
	hideQuoteMedia?: boolean
	shouldLoadMedia?: boolean
	hideFilteredOutArticles?: boolean
	mergeReposts?: boolean
	showArticleCount?: boolean
	maxMediaCount?: number | null
	separateMedia?: boolean
};

type EndpointStorage = {
	service: string
	endpointType: string
	params?: EndpointConstructorParams
	filters?: FilterInstance[]
	autoRefresh?: boolean
	onStart?: boolean
	onRefresh?: boolean
	loadTop?: boolean
	loadBottom?: boolean
};