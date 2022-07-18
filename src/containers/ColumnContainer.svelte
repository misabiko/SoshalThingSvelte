<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ContainerProps} from './index'
	import {articlesWithUniqueKeys} from "./index.js";

	export let props: ContainerProps;
	export let containerRef = undefined;
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.columnContainer
		background-color: $scheme-main-bis
</style>

<div class='articlesContainer columnContainer' bind:this={containerRef}>
	{#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleProps}
			timelineProps={props.timelineArticleProps}
		/>
	{/each}
</div>