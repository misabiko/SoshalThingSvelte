import type {ArticleWithRefs, ArticleProps, TimelineArticleProps} from '../articles'
import type {SvelteComponent} from 'svelte'

export type ContainerProps = {
	articles: ArticleProps[];
	columnCount: number;
	rtl: boolean;
	articleView: typeof SvelteComponent;
	timelineArticleProps: TimelineArticleProps;
	rebalanceTrigger: boolean;
}

export function articlesWithUniqueKeys(articles: ArticleWithRefs[]): [ArticleWithRefs, string][] {
	const idPairs = new Set<string>()
	return articles.map(a => {
		let i = 0
		let key = `${a.article.idPairStr}/${i}`
		while (idPairs.has(key)) {
			key = `${a.article.idPairStr}/${++i}`
		}

		idPairs.add(key)
		return [a, key]
	})
}

//TODO Thread tree container?