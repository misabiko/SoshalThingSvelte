import {type ArticleWithRefs, type ArticleProps, type TimelineArticleProps, getIdServiceMediaStr} from '~/articles';
import type {ComponentType} from 'svelte';
import {getRootArticle} from '~/articles';

export type ContainerProps = {
	articles: ArticleProps[];
	columnCount: number;
	rtl: boolean;
	articleView: ComponentType;
	timelineArticleProps: TimelineArticleProps;
	rebalanceTrigger: boolean;
	separateMedia: boolean;
}

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