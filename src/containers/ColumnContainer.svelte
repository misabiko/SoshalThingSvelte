<script lang='ts'>
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let containerRef = undefined;
	export let idPairs;
	export let articleView;
	export let columnCount: number; columnCount;
	export let animatedAsGifs;
	export let compact;
	export let hideText;
	export let shouldLoadMedia: boolean;
</script>

<div class='columnContainer' bind:this={containerRef}>
	{#each idPairs as idPair, index (JSON.stringify({...idPair, index}))}
		<ArticleComponent
			{idPair}
			view={articleView}
			{compact}
			{hideText}
			{animatedAsGifs}
			{shouldLoadMedia}
		/>
	{/each}
</div>