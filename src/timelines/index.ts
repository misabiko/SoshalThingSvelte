import type {ArticleIdPair} from '../services/article'
import type {SvelteComponent} from 'svelte'

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
	//TODO filters:
}