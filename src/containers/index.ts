import {type ArticleProps, type ArticleViewProps, type TimelineArticleProps, getIdServiceMediaStr} from '~/articles';
import type {Component} from 'svelte';

export type ContainerProps = {
	articles: ArticleProps[]
	columnCount: number
	rtl: boolean
	articleView: Component<ArticleViewProps, any, any>
	timelineArticleProps: TimelineArticleProps
	rebalanceTrigger: boolean
	separateMedia: boolean
};
//TODO Make ContainerProps type
export type ActualContainerProps = any;

export function articlesWithUniqueKeys(articles: ArticleProps[]): [ArticleProps, string][] {
	const idPairs = new Set<string>();
	return articles.map(a => {
		let i = 0;
		let key = `${getIdServiceMediaStr(a)}/${i}`;
		while (idPairs.has(key)) {
			key = `${getIdServiceMediaStr(a)}/${++i}`;
		}

		idPairs.add(key);
		return [a, key];
	});
}