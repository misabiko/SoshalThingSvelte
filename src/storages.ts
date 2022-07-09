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

		let initContainer: typeof SvelteComponent
		switch(defaulted.container) {
			case 'Row':
			case 'RowContainer':
				initContainer = RowContainer
				break
			case 'Masonry':
			case 'MasonryContainer':
				initContainer = MasonryContainer
				break
			case 'Column':
			case 'ColumnContainer':
			default:
				initContainer = ColumnContainer
				break
		}
		let initArticleView: typeof SvelteComponent
		switch (defaulted.articleView) {
			case 'Gallery':
			case 'GalleryArticle':
			case 'GalleryArticleView':
				initArticleView = GalleryArticleView
			case 'Social':
			case 'SocialArticle':
			case 'SocialArticleView':
			default:
				initArticleView = SocialArticleView
		}

		return {
			title: defaulted.title,
			fullscreen: false,
			endpoints: defaulted.endpoints,
			initArticles: [],
			initContainer,
			initArticleView,
			columnCount: defaulted.columnCount,
			width: defaulted.width,
		}
	})
}

type MainStorage = {
	fullscreen?: boolean | number
}

type TimelineStorage = {
	title: string
	container?: string
	articleView?: string
	endpoints: string[]//EndpointSerialized[]
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