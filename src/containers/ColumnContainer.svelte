<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ArticleWithRefs} from '../services/article'
	import {SvelteComponent} from 'svelte'

	export let containerRef = undefined;
	export let articlesWithRefs: ArticleWithRefs[];
	export let articleView: typeof SvelteComponent;
	export let columnCount: number; columnCount;
	export let animatedAsGifs: boolean;
	export let compact: boolean;
	export let hideText: boolean;
	export let shouldLoadMedia: boolean;
</script>

<div class='columnContainer' bind:this={containerRef}>
	{#each articlesWithRefs as articleWithRefs, index (JSON.stringify({...articleWithRefs.article.idPair, index}))}
		<ArticleComponent
			{articleWithRefs}
			view={articleView}
			{compact}
			{hideText}
			{animatedAsGifs}
			{shouldLoadMedia}
		/>
	{/each}
</div>