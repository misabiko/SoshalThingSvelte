import type {TimelineData, TimelineEndpoint} from './timelines'
import type {SvelteComponent} from 'svelte'
import ColumnContainer from './containers/ColumnContainer.svelte'
import RowContainer from './containers/RowContainer.svelte'
import MasonryContainer from './containers/MasonryContainer.svelte'
import SocialArticleView from './articles/SocialArticleView.svelte'
import GalleryArticleView from './articles/GalleryArticleView.svelte'
import {addEndpoint, Endpoint, getEndpointConstructors, getEndpoints, RefreshType} from './services/service'
import type {FilterInstance} from './filters'
import type {SortInfo} from './sorting'
import {SortMethod} from './sorting'

export const MAIN_STORAGE_KEY = 'SoshalThingSvelte'
export const TIMELINE_STORAGE_KEY = MAIN_STORAGE_KEY + ' Timelines'

export function loadMainStorage(): { fullscreen: number | undefined } {
	const item = localStorage.getItem(MAIN_STORAGE_KEY)
	const mainStorage = item ? JSON.parse(item) : {}

	if (mainStorage.fullscreen === false)
		delete mainStorage.fullscreen
	else if (mainStorage.fullscreen === true)
		mainStorage.fullscreen = 0

	return mainStorage
}

export function loadTimelines(): TimelineData[] {
	const item = localStorage.getItem(TIMELINE_STORAGE_KEY)
	let storage: Partial<TimelineStorage>[] = item ? JSON.parse(item) : []

	return storage.map(t => {
		const defaulted: TimelineStorage = {
			...DEFAULT_TIMELINE,
			...t,
		}

		const endpoints: TimelineEndpoint[] = []
		for (const endpointStorage of defaulted.endpoints) {
			const endpoint = parseAndLoadEndpoint(endpointStorage)
			if (endpoint !== undefined && !endpoints.find(e => e.name === endpoint.name))
				endpoints.push(endpoint)
		}

		return {
			title: defaulted.title,
			endpoints,
			initArticles: [],
			initContainer: parseContainer(defaulted.container),
			initArticleView: parseArticleView(defaulted.articleView),
			columnCount: defaulted.columnCount,
			width: defaulted.width,
			filters: defaulted.filters,
			sortInfo: parseSortInfo(defaulted.sortInfo),
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
	const endpoints = getEndpoints()
	const constructors = getEndpointConstructors()
	if (!constructors.hasOwnProperty(storage.service)) {
		console.error(`"${storage.service}" doesn't have any endpoint registered`)
		return undefined
	}else if (constructors[storage.service].length <= storage.endpointType) {
		console.error(`"${storage.service}" doesn't have endpointType "${storage.endpointType}"`)
		return undefined
	}

	const constructorInfo = constructors[storage.service][storage.endpointType]

	let endpoint = Object.values(endpoints).find(endpoint =>
		constructorInfo.name === (endpoint.constructor as typeof Endpoint).constructorInfo.name &&
		endpoint.matchParams(storage.params)
	)

	if (endpoint === undefined) {
		endpoint = constructorInfo.constructor(storage.params as any)
		addEndpoint(endpoint)
	}

	const refreshTypes = new Set<RefreshType>()
	if (storage.onStart === undefined ? true : storage.onStart)
		refreshTypes.add(RefreshType.RefreshStart)
	if (storage.onRefresh === undefined ? true : storage.onRefresh)
		refreshTypes.add(RefreshType.Refresh)
	if (storage.loadTop)
		refreshTypes.add(RefreshType.LoadTop)
	if (storage.loadBottom)
		refreshTypes.add(RefreshType.LoadBottom)

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
	fullscreen?: boolean | number
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
}

const DEFAULT_TIMELINE: TimelineStorage = {
	title: 'Timeline',
	endpoints: [],
	columnCount: 1,
	width: 1,
	compact: false,
	animatedAsGifs: false,
	hideText: false,
	filters: [],
	sortInfo: {
		method: undefined,
		reversed: false,
	}
}

type EndpointStorage = {
	service: string
	endpointType: number
	params?: object
	filters?: FilterInstance[]
	//autoRefresh: boolean
	onStart?: boolean
	onRefresh?: boolean
	loadTop?: boolean
	loadBottom?: boolean
}