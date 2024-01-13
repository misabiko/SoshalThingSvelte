import type {ArticleWithRefs, ArticleProps, TimelineArticleProps} from '~/articles';
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

export function articlesWithUniqueKeys<T extends ArticleWithRefs>(articles: T[]): [T, string][] {
	const idPairs = new Set<string>();
	return articles.map(a => {
		let i = 0;
		let key = `${getRootArticle(a).idPairStr}/${i}`;
		while (idPairs.has(key)) {
			key = `${getRootArticle(a).idPairStr}/${++i}`;
		}

		idPairs.add(key);
		return [a, key];
	});
}