<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ContainerProps} from './index'
	import {articlesWithUniqueKeys} from "./index.js";

	let {
		props,
		containerRef = undefined,
	} = $props<{
		props: ContainerProps,
		containerRef?: HTMLDivElement | undefined,
	}>();
</script>

<div class='articlesContainer columnContainer' bind:this={containerRef}>
	{#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleProps}
			timelineProps={props.timelineArticleProps}
		/>
	{/each}
</div>