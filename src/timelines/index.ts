import type {ArticleIdPair} from '../services/article'
import type {SvelteComponent} from 'svelte'
import type {FilterInstance} from '../filters'
import {SortMethod, type SortInfo} from '../sorting'
import ColumnContainer from '../containers/ColumnContainer.svelte'
import SocialArticleView from '../articles/SocialArticleView.svelte'
import type {RefreshType} from '../services/service'
import {defaultFilterInstances} from '../filters'

export type TimelineData = {
	title: string;
	endpoints: TimelineEndpoint[];
	initArticles?: ArticleIdPair[];
	initContainer?: typeof SvelteComponent;
	initArticleView?: typeof SvelteComponent;
	columnCount?: number;
	width?: number;
	filters: FilterInstance[];
	sortInfo: SortInfo
}

export const DEFAULT_TIMELINE: TimelineData = {
	title: 'Timeline',
	endpoints: [],
	initArticles: [],
	initContainer: ColumnContainer,
	initArticleView: SocialArticleView,
	columnCount: 1,
	width: 1,
	filters: defaultFilterInstances,
	sortInfo: {
		method: SortMethod.Date,
		reversed: true,
	}
}

export type TimelineEndpoint = {
	name: string;
	refreshTypes: Set<RefreshType>;
	filters: FilterInstance[]
}