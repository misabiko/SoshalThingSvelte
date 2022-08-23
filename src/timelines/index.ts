import type {ArticleAuthor, ArticleIdPair} from '../articles'
import type {SvelteComponent} from 'svelte'
import type {FilterInstance} from '../filters'
import {SortMethod, type SortInfo} from '../sorting'
import ColumnContainer from '../containers/ColumnContainer.svelte'
import SocialArticleView from '../articles/social/SocialArticleView.svelte'
import {defaultFilterInstances} from '../filters'
import type {Endpoint, RefreshType} from '../services/endpoints'
import type {Writable} from 'svelte/store'
import {writable} from 'svelte/store'
import {everyRefreshType} from '../services/endpoints'
import MasonryContainer from '../containers/MasonryContainer.svelte'
import {getServices} from '../services/service'

export type TimelineData = {
	title: string;
	endpoints: TimelineEndpoint[];
	articles: Writable<ArticleIdPair[]>;
	section: { useSection: boolean; count: number };
	container: typeof SvelteComponent;
	articleView: typeof SvelteComponent;
	columnCount: number;
	rtl: boolean;
	width: number;
	filters: FilterInstance[];
	sortInfo: SortInfo;
	animatedAsGifs: boolean;
	scrollSpeed: number;
	hideText: boolean;
	compact: boolean;
	shouldLoadMedia: boolean;
	hideFilteredOutArticles: boolean;
	mergeReposts: boolean;
	showArticleCount: boolean;
	maxMediaCount: number | null;
}

export function defaultTimeline(articles: ArticleIdPair[] = []): TimelineData {
	return {
		title: 'Timeline',
		endpoints: [],
		articles: writable(articles),
		section: {useSection: false, count: 100},
		container: ColumnContainer,
		articleView: SocialArticleView,
		columnCount: 1,
		rtl: false,
		width: 1,
		filters: defaultFilterInstances,
		sortInfo: {
			method: SortMethod.Date,
			reversed: true,
		},
		animatedAsGifs: false,
		scrollSpeed: 3,
		hideText: false,
		compact: false,
		shouldLoadMedia: true,
		hideFilteredOutArticles: true,
		mergeReposts: true,
		showArticleCount: false,
		maxMediaCount: 4,
	}
}

export type TimelineEndpoint = {
	name: string;
	endpoint?: never;
	refreshTypes: Set<RefreshType>;
	filters: FilterInstance[]
} | {
	name?: never;
	endpoint: Endpoint;
	refreshTypes: Set<RefreshType>;
	filters: FilterInstance[]
}

export type FullscreenInfo = {
	index: number | null;
	columnCount: number | null;
	container: typeof SvelteComponent | null;
}

export function newUserTimeline(serviceName: string, author: ArticleAuthor): TimelineData | undefined {
	const endpointConstructor = getServices()[serviceName].userEndpoint
	if (endpointConstructor === undefined)
		return undefined

	return {
		...defaultTimeline(),
		title: author.name,
		endpoints: [{
			endpoint: endpointConstructor(author),
			refreshTypes: everyRefreshType,
			filters: [],
		}],
		filters: [
			...defaultFilterInstances,
			{
				filter: {type: 'media', service: null},
				enabled: true,
				inverted: false,
			},
			{
				filter: {type: 'noRef', service: null},
				enabled: true,
				inverted: false,
			}
		],
		container: MasonryContainer,
		columnCount: 3,
	}
}