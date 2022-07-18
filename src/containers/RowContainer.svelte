<script lang="ts">
	import ArticleComponent from "../articles/ArticleComponent.svelte";
	import type {ContainerProps} from './index'
	import {articlesWithUniqueKeys} from "./index.js";

	export let containerRef = undefined;
	export let props: ContainerProps;
</script>

<style lang='sass'>
	@use '../styles/variables' as *

	.articlesContainer.rowContainer
		display: flex
		flex-wrap: wrap
		align-items: flex-start
		background-color: $scheme-main-bis
</style>

<div class='articlesContainer rowContainer' bind:this={containerRef}>
	{#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleProps}
			timelineProps={props.timelineArticleProps}
			style={`width: calc(100% / ${props.columnCount})`}
		/>
	{/each}
</div>