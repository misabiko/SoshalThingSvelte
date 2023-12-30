<script lang='ts'>
	import ArticleComponent from '../articles/ArticleComponent.svelte';
	import type {ContainerProps} from './index';
	import {articlesWithUniqueKeys} from './index';

	export let props: ContainerProps;
	export let containerRef = null;
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