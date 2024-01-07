<script lang="ts">
	import ArticleComponent from '../articles/ArticleComponent.svelte';
	import type {ContainerProps} from './index';
	import {articlesWithUniqueKeys} from './index';

	export let containerRef = null;
	export let props: ContainerProps;
</script>

<style>
	.articlesContainer.rowContainer {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		align-content: flex-start;
	}
</style>

<div class='articlesContainer rowContainer' bind:this={containerRef} style:flex-direction={props.rtl ? 'row-reverse' : null}>
	{#each articlesWithUniqueKeys(props.articles) as [articleProps, key] (key)}
		<ArticleComponent
			view={props.articleView}
			{articleProps}
			timelineProps={props.timelineArticleProps}
			style={`width: calc(100% / ${props.columnCount})`}
		/>
	{/each}
</div>