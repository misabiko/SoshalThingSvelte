<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ArticleWithRefs} from '../services/article'
	import {SvelteComponent} from 'svelte'
	import type {ContainerProps} from './index'

	export let props: ContainerProps;
	export let containerRef = undefined;
</script>

<div class='columnContainer' bind:this={containerRef}>
	{#each props.articles as articleWithRefs, index (articleWithRefs.article.idPairStr)}
		<ArticleComponent
			view={props.articleView}
			{articleWithRefs}
			props={props.articleProps}
		/>
	{/each}
</div>