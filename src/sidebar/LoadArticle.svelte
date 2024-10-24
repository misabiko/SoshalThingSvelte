<script lang='ts'>
	import {getServices, type Service} from '~/services/service';
	import ArticleComponent from '../articles/ArticleComponent.svelte';
	import SocialArticleView from '../articles/social/SocialArticleView.svelte';
	import type {ArticleProps, ArticleWithRefs, TimelineArticleProps} from '~/articles';
	import {writable} from 'svelte/store';

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

	let timelineProps: TimelineArticleProps = {
		animatedAsGifs: false,
		muteVideos: false,
		compact: false,
		fullMedia: 0,
		hideQuoteMedia: false,
		hideText: false,
		shouldLoadMedia: false,
		maxMediaCount: 4,
		setModalTimeline: () => {},
		showAllMediaArticles: writable(new Set())
	};

	let articleProps: ArticleProps | null;
	$: article !== null ? {
		...article,
		filteredOut: false,
		nonKeepFilters: [],
	} : null;
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
	<button onclick={loadArticle} disabled='{serviceName === null || !articleId.length}'>Load</button>
</div>
{#if article !== null && articleProps !== null}
	<ArticleComponent
			view={SocialArticleView}
			{articleProps}
			bind:timelineProps
	/>
{/if}