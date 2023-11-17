import type {FullscreenInfo, TimelineCollection, TimelineEndpoint, TimelineView} from '../timelines';
import type {SvelteComponent} from 'svelte';
import ColumnContainer from '../containers/ColumnContainer.svelte';
import RowContainer from '../containers/RowContainer.svelte';
import MasonryContainer from '../containers/MasonryContainer.svelte';
import SocialArticleView from '../articles/social/SocialArticleView.svelte';
import GalleryArticleView from '../articles/gallery/GalleryArticleView.svelte';
import {getServices} from '../services/service';
import type {FilterInstance} from '../filters';
import type {SortInfo} from '../sorting';
import {SortMethod} from '../sorting';
import {defaultTimeline} from '../timelines';
import {defaultFilterInstances} from '../filters';
import {
	addEndpoint,
	Endpoint,
	endpoints,
	RefreshType,
	startAutoRefresh,
} from '../services/endpoints';
import type {EndpointConstructorParams} from '../services/endpoints';
import {derived, get} from 'svelte/store';

export const MAIN_STORAGE_KEY = 'SoshalThingSvelte';
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines';

export function loadMainStorage() {
	const item = localStorage.getItem(MAIN_STORAGE_KEY);
	const mainStorage: MainStorage = item ? JSON.parse(item) : {};

	mainStorage.timelineIds ??= null;

	(mainStorage as MainStorageParsed).fullscreen = parseFullscreenInfo(mainStorage.fullscreen);

	if (!mainStorage.maximized)
		mainStorage.maximized = false;

	if (!mainStorage.timelineViews)
		mainStorage.timelineViews = {};
	else
		for (const view in mainStorage.timelineViews)
			if (Object.hasOwn(mainStorage.timelineViews, view))
				(mainStorage as MainStorageParsed).timelineViews[view].fullscreen = parseFullscreenInfo(mainStorage.timelineViews[view].fullscreen);

	(mainStorage as MainStorageParsed).defaultTimelineView = mainStorage.defaultTimelineView ?? null;

	if (!mainStorage.useWebSocket)
		mainStorage.useWebSocket = false;

	return mainStorage as MainStorageParsed;
}

//TODO Type storage per storage
export function getServiceStorage(service: string): { [key: string]: any } {
	const storageKey = `${MAIN_STORAGE_KEY} ${service}`;
	const item = localStorage.getItem(storageKey);
	return item ? JSON.parse(item) : {};
}

export function updateServiceStorage(service: string, key: string, value: any) {
	const storageKey = `${MAIN_STORAGE_KEY} ${service}`;
	const item = localStorage.getItem(storageKey);
	const storage = item ? JSON.parse(item) : {};
	storage[key] = value;

	localStorage.setItem(storageKey, JSON.stringify(storage));
}

export function updateMainStorage(key: string, value: any) {
	const item = localStorage.getItem(MAIN_STORAGE_KEY);
	const storage = item ? JSON.parse(item) : {};
	storage[key] = value;

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
			...DEFAULT_TIMELINE_STORAGE,
			...t,
		};

		const endpoints: TimelineEndpoint[] = [];
		for (const endpointStorage of defaulted.endpoints) {
			const endpoint = parseAndLoadEndpoint(endpointStorage);
			if (endpoint !== undefined && !endpoints.find(e => e.name === endpoint.name))
				endpoints.push(endpoint);
		}

		parseFilters(defaulted.filters);

		return [id, {
			...defaultTimeline(),
			title: defaulted.title,
			endpoints,
			container: parseContainer(defaulted.container),
			articleView: parseArticleView(defaulted.articleView),
			columnCount: defaulted.columnCount,
			width: defaulted.width,
			filters: defaulted.filters,
			sortInfo: parseSortInfo(defaulted.sortInfo),
			section: defaulted.section ?? {
				useSection: false,
				count: 100
			}
		}];
	}));
}

export function updateTimelinesStorage(timelines: TimelineCollection) {
	const storage = Object.fromEntries(Object.entries(timelines).map(([id, t]) => [id, {
		title: t.title,
		//TODO Serialize more timeline properties
		// container?: string
		// articleView?: string
		// endpoints: EndpointStorage[]
		// columnCount: number
		// width: number
		// filters: FilterInstance[],
		// sortInfo: {
		// 	method?: string | null
		// 	reversed: boolean
		// },
		// compact: boolean
		// animatedAsGifs: boolean
		// hideText: boolean
		// section?: {
		// 	useSection: boolean
		// 	count: number
		// }
	}]));

	localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(storage));
}

function parseContainer(container: string | undefined): typeof SvelteComponent {
	switch(container) {
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

function parseArticleView(articleView: string | undefined): typeof SvelteComponent {
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
	const services = getServices();
	const endpointsValue = get(derived(Object.values(endpoints), e => e));
	if (!Object.hasOwn(services, storage.service)) {
		console.error(`"${storage.service}" isn't a registered service`);
		return undefined;
	}else if (services[storage.service].endpointConstructors.length <= storage.endpointType) {
		console.error(`"${storage.service}" doesn't have endpointType "${storage.endpointType}"`);
		return undefined;
	}

	const constructorInfo = services[storage.service].endpointConstructors[storage.endpointType];

	let endpoint = endpointsValue.find(endpoint =>
		constructorInfo.name === (endpoint.constructor as typeof Endpoint).constructorInfo.name &&
		endpoint.matchParams(storage.params)
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
	if (storage.onStart === undefined ? true : storage.onStart)
		refreshTypes.add(RefreshType.RefreshStart);
	if (storage.onRefresh === undefined ? true : storage.onRefresh)
		refreshTypes.add(RefreshType.Refresh);
	if (storage.loadTop === undefined ? true : storage.loadTop)
		refreshTypes.add(RefreshType.LoadTop);
	if (storage.loadBottom === undefined ? true : storage.loadBottom)
		refreshTypes.add(RefreshType.LoadBottom);

	if (storage.autoRefresh)
		startAutoRefresh(endpoint.name);

	parseFilters(storage.filters);

	return {
		name: endpoint.name,
		refreshTypes,
		filters: storage.filters || [],
	};
}

function parseSortInfo({method, reversed}: TimelineStorage['sortInfo']): SortInfo {
	let sortMethod: SortMethod | null = null;
	switch (method?.toLowerCase()) {
		case 'id':
			sortMethod = SortMethod.Id;
			break;
		case 'date':
			sortMethod = SortMethod.Date;
			break;
		case 'likes':
			sortMethod = SortMethod.Likes;
			break;
		case 'reposts':
			sortMethod = SortMethod.Reposts;
			break;
	}
	return {
		method: sortMethod,
		customMethod: null,
		reversed: reversed || false
	};
}

function parseFilters(filters: FilterInstance[] | undefined) {
	if (filters === undefined)
		return;

	for (const instance of filters) {
		instance.filter.service ??= null;

		if (instance.filter.service !== null && !Object.hasOwn(getServices(), instance.filter.service))
			console.error(`Service ${instance.filter.service} isn't registered.`, instance);
	}
}

function parseFullscreenInfo(fullscreen?: boolean | number | FullscreenInfoStorage): FullscreenInfo {
	if (!fullscreen && fullscreen !== 0)
		fullscreen = {
			index: null,
			columnCount: null,
			container: null
		};
	else if (fullscreen === true)
		fullscreen = {
			index: 0,
			columnCount: null,
			container: null
		};
	else if (typeof fullscreen === 'number')
		fullscreen = {
			index: fullscreen,
			columnCount: null,
			container: null,
		};

	const containerString = fullscreen?.container as string | undefined;
	if (containerString)
		(fullscreen as FullscreenInfo).container = parseContainer(containerString);

	return fullscreen;
}

type MainStorage = Partial<MainStorageParsed> & {
	defaultTimelineView?: string
	timelineViews: {[name: string]: TimelineViewStorage}
	fullscreen?: boolean | number | FullscreenInfoStorage
}

type MainStorageParsed = {
	timelineIds: TimelineView['timelineIds'] | null
	defaultTimelineView: string | null
	timelineViews: {[name: string]: TimelineView}
	fullscreen: FullscreenInfo
	maximized: boolean
	markAsReadLocal: boolean
	//TODO Add UI setting for websocket
	useWebSocket: boolean
}

type FullscreenInfoStorage = FullscreenInfo & {
	container: string | null
}

type TimelineViewStorage = TimelineView & {
	fullscreen: FullscreenInfoStorage
}

type TimelineStorage = {
	title: string
	container?: string
	articleView?: string
	endpoints: EndpointStorage[]
	columnCount: number
	width: number
	filters: FilterInstance[],
	sortInfo: {
		method?: string | null
		reversed: boolean
	},
	compact: boolean
	animatedAsGifs: boolean
	hideText: boolean
	section?: {
		useSection: boolean
		count: number
	}
}

const DEFAULT_TIMELINE_STORAGE: TimelineStorage = {
	title: 'Timeline',
	endpoints: [],
	columnCount: 1,
	width: 1,
	compact: false,
	animatedAsGifs: false,
	hideText: false,
	filters: defaultFilterInstances,
	sortInfo: {
		method: null,
		reversed: false,
	}
};

type EndpointStorage = {
	service: string
	endpointType: number
	params?: EndpointConstructorParams
	filters?: FilterInstance[]
	autoRefresh?: boolean
	onStart?: boolean
	onRefresh?: boolean
	loadTop?: boolean
	loadBottom?: boolean
}