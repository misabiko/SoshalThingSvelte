import type {ArticleIdPair} from '../services/article'
import type {SvelteComponent} from 'svelte'
import type {FilterInstance} from '../filters'
import {SortMethod, type SortInfo} from '../sorting'
import ColumnContainer from '../containers/ColumnContainer.svelte'
import SocialArticleView from '../articles/social/SocialArticleView.svelte'
import {defaultFilterInstances} from '../filters'
import type {Endpoint, RefreshType} from '../services/endpoints'

export type TimelineData = {
	title: string;
	endpoints: TimelineEndpoint[];
	articles: ArticleIdPair[];
	container: typeof SvelteComponent;
	articleView: typeof SvelteComponent;
	columnCount: number;
	width: number;
	filters: FilterInstance[];
	sortInfo: SortInfo;
	animatedAsGifs: boolean;
	scrollSpeed: number;
	hideText: boolean;
	compact: boolean;
	shouldLoadMedia: boolean;
	hideFilteredOutArticles: boolean;
}

export function defaultTimeline(): TimelineData {
	return {
		title: 'Timeline',
		endpoints: [],
		articles: [],
		container: ColumnContainer,
		articleView: SocialArticleView,
		columnCount: 1,
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