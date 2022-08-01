import type {FullscreenInfo, TimelineData, TimelineEndpoint} from '../timelines'
import type {SvelteComponent} from 'svelte'
import ColumnContainer from '../containers/ColumnContainer.svelte'
import RowContainer from '../containers/RowContainer.svelte'
import MasonryContainer from '../containers/MasonryContainer.svelte'
import SocialArticleView from '../articles/social/SocialArticleView.svelte'
import GalleryArticleView from '../articles/GalleryArticleView.svelte'
import {getServices} from '../services/service'
import type {FilterInstance} from '../filters'
import type {SortInfo} from '../sorting'
import {SortMethod} from '../sorting'
import {defaultTimeline} from '../timelines'
import {defaultFilterInstances} from '../filters'
import {
	addEndpoint,
	Endpoint,
	endpoints,
	RefreshType,
	startAutoRefresh,
} from '../services/endpoints'
import type {EndpointConstructorParams} from '../services/endpoints'
import {derived, get} from 'svelte/store'

export const MAIN_STORAGE_KEY = 'SoshalThingSvelte'
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines'

export function loadMainStorage() {
	const item = localStorage.getItem(MAIN_STORAGE_KEY)
	const mainStorage: MainStorage = item ? JSON.parse(item) : {}

	if (!mainStorage.fullscreen && mainStorage.fullscreen !== 0)
		mainStorage.fullscreen = {
			index: null,
			columnCount: null,
			container: null
		}
	else if (mainStorage.fullscreen === true)
		mainStorage.fullscreen = {
			index: 0,
			columnCount: null,
			container: null
		}
	else if (typeof mainStorage.fullscreen === 'number')
		mainStorage.fullscreen = {
			index: mainStorage.fullscreen,
			columnCount: null,
			container: null,
		}

	const containerString = mainStorage.fullscreen?.container
	if (containerString)
		(mainStorage.fullscreen as FullscreenInfo).container = parseContainer(containerString)

	if (!mainStorage.maximized)
		mainStorage.maximized = false

	return mainStorage as MainStorageParsed
}

export function updateFullscreenStorage(fullscreen: FullscreenInfo) {
	const item = localStorage.getItem(MAIN_STORAGE_KEY)
	const storage = item ? JSON.parse(item) : {}
	storage.fullscreen = fullscreen

	localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage))
}

export function updateMaximized(maximized: boolean) {
	const item = localStorage.getItem(MAIN_STORAGE_KEY)
	const storage = item ? JSON.parse(item) : {}
	storage.maximized = maximized

	localStorage.setItem(MAIN_STORAGE_KEY, JSON.stringify(storage))
}

export function loadTimelines(): TimelineData[] {
	const item = localStorage.getItem(TIMELINE_STORAGE_KEY)
	let storage: Partial<TimelineStorage>[] = item ? JSON.parse(item) : []

	return storage.map(t => {
		const defaulted: TimelineStorage = {
			...DEFAULT_TIMELINE_STORAGE,
			...t,
		}

		const endpoints: TimelineEndpoint[] = []
		for (const endpointStorage of defaulted.endpoints) {
			const endpoint = parseAndLoadEndpoint(endpointStorage)
			if (endpoint !== undefined && !endpoints.find(e => e.name === endpoint.name))
				endpoints.push(endpoint)
		}

		return {
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
		}
	})
}

function parseContainer(container: string | undefined): typeof SvelteComponent {
	switch(container) {
		case 'Row':
		case 'RowContainer':
			return RowContainer
		case 'Masonry':
		case 'MasonryContainer':
			return MasonryContainer
		case 'Column':
		case 'ColumnContainer':
		default:
			return ColumnContainer
	}
}

function parseArticleView(articleView: string | undefined): typeof SvelteComponent {
	switch (articleView) {
		case 'Gallery':
		case 'GalleryArticle':
		case 'GalleryArticleView':
			return GalleryArticleView
		case 'Social':
		case 'SocialArticle':
		case 'SocialArticleView':
		default:
			return SocialArticleView
	}
}

function parseAndLoadEndpoint(storage: EndpointStorage): TimelineEndpoint | undefined {
	const services = getServices()
	const endpointsValue = get(derived(Object.values(endpoints), e => e))
	if (!services.hasOwnProperty(storage.service)) {
		console.error(`"${storage.service}" isn't a registered service`)
		return undefined
	}else if (services[storage.service].endpointConstructors.length <= storage.endpointType) {
		console.error(`"${storage.service}" doesn't have endpointType "${storage.endpointType}"`)
		return undefined
	}

	const constructorInfo = services[storage.service].endpointConstructors[storage.endpointType]

	let endpoint = endpointsValue.find(endpoint =>
		constructorInfo.name === (endpoint.constructor as typeof Endpoint).constructorInfo.name &&
		endpoint.matchParams(storage.params)
	)

	if (endpoint === undefined) {
		if (storage.params === undefined)
			storage.params = {}

		for (const [param, defaultValue] of constructorInfo.paramTemplate)
			if (!storage.params.hasOwnProperty(param))
				storage.params[param] = defaultValue

		endpoint = constructorInfo.constructor(storage.params)
		addEndpoint(endpoint)
	}

	const refreshTypes = new Set<RefreshType>()
	if (storage.onStart === undefined ? true : storage.onStart)
		refreshTypes.add(RefreshType.RefreshStart)
	if (storage.onRefresh === undefined ? true : storage.onRefresh)
		refreshTypes.add(RefreshType.Refresh)
	if (storage.loadTop === undefined ? true : storage.loadTop)
		refreshTypes.add(RefreshType.LoadTop)
	if (storage.loadBottom === undefined ? true : storage.loadBottom)
		refreshTypes.add(RefreshType.LoadBottom)

	if (storage.autoRefresh)
		startAutoRefresh(endpoint.name)

	if (storage.filters)
		for (const instance of storage.filters)
			if (instance.filter.service !== null && !instance.filter.service)
				console.error('Missing service on', instance)

	return {
		name: endpoint.name,
		refreshTypes,
		filters: storage.filters || [],
	}
}

function parseSortInfo({method, reversed}: {method?: string, reversed: boolean}): SortInfo {
	let sortMethod: SortMethod | undefined
	switch (method?.toLowerCase()) {
		case 'id':
			sortMethod = SortMethod.Id
			break;
		case 'date':
			sortMethod = SortMethod.Date
			break;
		case 'likes':
			sortMethod = SortMethod.Likes
			break;
		case 'reposts':
			sortMethod = SortMethod.Reposts
			break;
	}
	return {
		method: sortMethod,
		reversed: reversed || false
	}
}

type MainStorage = {
	fullscreen?: boolean | number | FullscreenInfoStorage
	maximized?: boolean
}

type MainStorageParsed = {
	fullscreen: FullscreenInfo
	maximized: boolean
}

type FullscreenInfoStorage = FullscreenInfo & {
	container: string | null
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
		method?: string
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
		method: undefined,
		reversed: false,
	}
}

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