import type {SvelteComponent} from 'svelte'

export type ArticleProps = {
	animatedAsGifs: boolean;
	compact: boolean;
	hideText: boolean;
	shouldLoadMedia: boolean;
}