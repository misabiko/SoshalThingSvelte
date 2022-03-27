<script>
	import ArticleComponent from "../articles/ArticleComponent.svelte";

	export let idPairs;
	export let articleView;
	export let animatedAsGifs;
	export let socialSettings;
</script>

<div class='columnContainer'>
	{#each idPairs as idPair (idPair)}
		<ArticleComponent {idPair} view={articleView} {socialSettings} {animatedAsGifs}/>
	{/each}
</div>