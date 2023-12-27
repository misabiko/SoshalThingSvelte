<script lang='ts'>
	import {getServices, type Service} from '../services/service';
	import ArticleComponent from '../articles/ArticleComponent.svelte';
	import SocialArticleView from '../articles/social/SocialArticleView.svelte';
	import type {ArticleWithRefs} from '../articles';

	type LoadArticleService = Service & {loadArticle: Exclude<Service['loadArticle'], null>};
	let services = Object.entries(getServices()).filter(([_, s]) => s.loadArticle !== null) as [string, LoadArticleService][];
	let serviceName = services.length ? services[0][0] : null;

	let articleId = '';
	let article: ArticleWithRefs | null = null;

	async function loadArticle() {
		if (serviceName === null)
			throw new Error('No service selected');

		try {
			article = await (getServices()[serviceName] as LoadArticleService).loadArticle(articleId);
		} catch (e) {
			console.error(`Failed to load article "${articleId}"`, e);
		}
	}

	let timelineProps = {
		animatedAsGifs: false,
		compact: false,
		hideText: false,
		shouldLoadMedia: false,
		maxMediaCount: 4,
		setModalTimeline: () => {},
	};
</script>

<style>
	.loadArticleMenu {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
</style>

<div class='loadArticleMenu'>
	<select bind:value={serviceName}>
		{#each services as [service, _]}
			<option value={service}>{service}</option>
		{/each}
	</select>
	<input bind:value={articleId}/>
	<button on:click={loadArticle} disabled={serviceName === null || !articleId.length}>Load</button>
</div>
{#if article !== null}
	<ArticleComponent
			view={SocialArticleView}
			articleProps={{
				...article,
				filteredOut: false,
			}}
			bind:timelineProps
	/>
{/if}