import type {ArticleIdPair} from '../services/article'
import type {SvelteComponent} from 'svelte'
import type {FilterInstance} from '../filters'

export type TimelineData = {
	title: string;
	endpoints: TimelineEndpoint[];
	initArticles?: ArticleIdPair[];
	initContainer?: typeof SvelteComponent;
	initArticleView?: typeof SvelteComponent;
	columnCount?: number;
	width?: number;
}

export type TimelineEndpoint = {
	name: string;
	onStart: boolean;
	onRefresh: boolean;
	filters: FilterInstance[]
}