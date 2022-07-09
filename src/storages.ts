import type {TimelineData} from './components/timelines'
import type {SvelteComponent} from 'svelte'
import ColumnContainer from './components/containers/ColumnContainer.svelte'
import RowContainer from './components/containers/RowContainer.svelte'
import MasonryContainer from './components/containers/MasonryContainer.svelte'
import SocialArticleView from './components/articles/SocialArticleView.svelte'
import GalleryArticleView from './components/articles/GalleryArticleView.svelte'

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

		return {
			title: defaulted.title,
			fullscreen: false,
			endpoints: defaulted.endpoints.map(parseAndLoadEndpoint).filter(e => e !== undefined) as string[],
			initArticles: [],
			initContainer: parseContainer(defaulted.container),
			initArticleView: parseArticleView(defaulted.articleView),
			columnCount: defaulted.columnCount,
			width: defaulted.width,
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

function parseAndLoadEndpoint(endpoint: EndpointStorage): string | undefined {
	return undefined
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
	//filters: Option<FilterCollection>,
	//sortMethod: Option<(SortMethod, bool)>,
	compact: boolean
	animatedAsGifs: boolean
	hideText: boolean
}

const DEFAULT_TIMELINE: TimelineStorage = {
	title: 'Timeline',
	endpoints: [],
	columnCount: 1,
	width: 1,
	//filters: Option<FilterCollection>,
	//sortMethod: Option<(SortMethod, bool)>,
	compact: false,
	animatedAsGifs: false,
	hideText: false,
}

type EndpointStorage = {
	service: string
	endpointType: number
	params?: object
	//filters:
	//autoRefresh: boolean
	onStart?: boolean
	onRefresh?: boolean
}