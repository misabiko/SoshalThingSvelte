<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ContainerProps} from './index'
	import {articlesWithUniqueKeys} from "./index.js";

	export let props: ContainerProps;
	export let containerRef = undefined;
</script>

<div class='articlesContainer columnContainer' bind:this={containerRef}>
	{#each articlesWithUniqueKeys(props.articles) as [articleWithRefs, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleWithRefs}
			props={props.articleProps}
		/>
	{/each}
</div>