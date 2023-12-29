<script lang='ts'>
	import type {ArticleIdPair} from "./index"
	import {getWritable, toggleMarkAsRead} from '../services/service';
	import Article, {getActualArticle} from '../articles'
	import type {ArticleProps, TimelineArticleProps} from './index'
	import {afterUpdate, type SvelteComponent} from 'svelte';
	import {getContext} from 'svelte'
	import {getRootArticle} from './index'
	import Modal from '../Modal.svelte'
	import {MediaLoadType} from './media';
	import {LoadingState, loadingStore} from '../bufferedMediaLoading';

	export let articleProps: ArticleProps
	export let timelineProps: TimelineArticleProps
	export let view: new (...args: any[]) => SvelteComponent;
	export let style = ''; style;
	let modal = false
	let showAllMedia = false

	const isInjected = getContext('isInjected') as boolean

	let rootArticle: Readonly<Article>
	let actualArticle: Readonly<Article>
	$: {
		rootArticle = getRootArticle(articleProps)
		actualArticle = getActualArticle(articleProps)
	}

	let divRef: HTMLDivElement | null = null;
	let mediaRefs: HTMLImageElement[] = [];
	let loadingStates: LoadingState[] = []
	$: {
		loadingStates = []
		for (let mediaIndex = 0; mediaIndex < actualArticle.medias.length; ++mediaIndex)
			loadingStates.push(loadingStore.getLoadingState(actualArticle.idPair, mediaIndex, timelineProps.shouldLoadMedia))
	}

	afterUpdate(() => {
		{
			const modifiedMedias: [number, number][] = []
			for (let i = 0; i < mediaRefs.length; ++i)
				if (actualArticle.medias[i].ratio === null)
					modifiedMedias.push([i, mediaRefs[i].clientHeight / mediaRefs[i].clientWidth])

			getWritable(actualArticle.idPair).update(a => {
				for (const [i, ratio] of modifiedMedias)
					a.medias[i].ratio = ratio
				return a
			})
		}

		const count = actualArticle.medias.length
		for (let i = 0; i < count; ++i) {
			if (actualArticle.medias[i].queueLoadInfo === MediaLoadType.LazyLoad && !actualArticle.medias[i].loaded) {
				if (mediaRefs[i]?.complete)
					loadingStore.mediaLoaded(actualArticle.idPair, i)
			}
		}
	})

	function onLogData() {
		console.dir(articleProps)
	}

	function onLogJSON() {
		switch (articleProps.type) {
			case 'normal':
				console.dir({
					...articleProps,
					article: articleProps.article.rawSource,
				})
				break;
			case 'reposts':
				console.dir({
					...articleProps,
					reposted: getRootArticle(articleProps.reposted).rawSource
				})
				break;
			case 'quote':
				console.dir({
					article: getRootArticle(articleProps).rawSource,
					quoted: getRootArticle(articleProps.quoted).rawSource
				})
				break;
		}
	}

	function onMediaClick(idPair: ArticleIdPair, _index: number) {
		toggleMarkAsRead(idPair)
	}
</script>

<style>
	article {
		background-color: var(--scheme-main-bis);
	}

	article.transparent {
		opacity: 20%;
	}

	:global(.modal .modal-content) {
		width: 75%;
	}
</style>

{#if modal}
<!-- TODO Find way to get specific parent soshalthing -->
	<Modal bind:active={modal} mountElement={document.getElementsByClassName('soshalthing')[0]}>
		<article class:transparent={articleProps.filteredOut}>
			<svelte:component
				this={view}
				{timelineProps}
				bind:modal
				bind:showAllMedia
				{articleProps}
				{rootArticle}
				{actualArticle}
				{onLogData}
				{onLogJSON}
				{onMediaClick}
				bind:divRef
				bind:mediaRefs
				bind:loadingStates
			/>
		</article>
	</Modal>
{/if}

<article class={articleProps.filteredOut ? 'transparent' : ''} {style}>
	<svelte:component
		this={view}
		{timelineProps}
		bind:modal
		bind:showAllMedia
		{articleProps}
		{rootArticle}
		{actualArticle}
		{onLogData}
		{onLogJSON}
		{onMediaClick}
		bind:divRef
		bind:mediaRefs
		bind:loadingStates
	/>
</article>