import type {ArticleIdPair, ArticleWithRefs} from '../services/article'
import type {ArticleProps} from '../articles'
import type {SvelteComponent} from 'svelte'

export type ContainerProps = {
	articles: ArticleWithRefs[];
	columnCount: number;
	articleView: typeof SvelteComponent;
	articleProps: ArticleProps;
	rebalanceTrigger: boolean;
}