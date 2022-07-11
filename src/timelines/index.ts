import type {ArticleIdPair} from '../services/article'
import type {SvelteComponent} from 'svelte'

export type TimelineData = {
	title: string;
	endpoints: string[];
	initArticles?: ArticleIdPair[];
	initContainer?: typeof SvelteComponent;
	initArticleView?: typeof SvelteComponent;
	columnCount?: number;
	width?: number;
}