import type Article from '../../services/article'

export type TimelineData = {
	title: string;
	fullscreen?: boolean;
	endpoints: string[];
	initArticles?: Article[];
	initContainer?: any;
	initArticleView?: any;
	columnCount?: number;
}