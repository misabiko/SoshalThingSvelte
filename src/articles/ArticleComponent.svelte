<script lang='ts'>
	import {type ArticleIdPair, type ArticleViewProps, getActualArticleRefs} from './index';
	import {getWritableArticle, toggleMarkAsRead} from '~/services/service';
	import {getActualArticle} from '../articles';
	import type {ArticleProps, TimelineArticleProps} from './index';
	import {type Component, onDestroy, tick} from 'svelte';
	import {getRootArticle} from './index';
	import Modal from '../Modal.svelte';
	import {MediaLoadType} from './media';
	import {LoadingState, loadingStore} from '~/bufferedMediaLoading';
	import {writable, type Writable} from 'svelte/store';

	let {
		articleProps,
		timelineProps = $bindable(),
		view: View,
		style = '',
	}: {
		articleProps: ArticleProps
		timelineProps: TimelineArticleProps
		view: Component<ArticleViewProps>
		style?: string
	} = $props();
	let actualArticleProps = getActualArticleRefs(articleProps) as ArticleProps;
	let modal = $state(false);

	let rootArticle = $derived(getRootArticle(articleProps));
	let actualArticle = $derived(getActualArticle(articleProps));
	let showAllMediaArticles = $derived(timelineProps.showAllMediaArticles);
	let showAllMedia = $derived($showAllMediaArticles.has(rootArticle.idPairStr));

	let divRef = $state<HTMLDivElement | null>(null);
	let mediaRefs = $state<Record<number, HTMLImageElement | undefined>>({});
	//TODO Try porting loadingStates to runes with a svelte.ts file
	// svelte-ignore non_reactive_update
	let loadingStates: Writable<Record<number, LoadingState>> = writable({});
	$effect(() => {
		$loadingStates = [];
		if (actualArticleProps.mediaIndex === null) {
			for (let mediaIndex = 0; mediaIndex < Math.min(actualArticle.medias.length, !showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : Infinity); ++mediaIndex)
				$loadingStates[mediaIndex] = loadingStore.getLoadingState(actualArticle.idPair, mediaIndex, timelineProps.shouldLoadMedia);
		}else
			$loadingStates[actualArticleProps.mediaIndex] = loadingStore.getLoadingState(actualArticle.idPair, actualArticleProps.mediaIndex, timelineProps.shouldLoadMedia);
	});

	tick().then(() => {
		{
			const modifiedMedias: [number, number][] = [];
			for (const [iStr, mediaRef] of Object.entries(mediaRefs)) {
				const i = parseInt(iStr);
				//Not sure why mediaRef can be specifically null, docs says undefined only
				if (actualArticle.medias[i]!.ratio === null && mediaRef != undefined)
					modifiedMedias.push([i, mediaRef.clientHeight / mediaRef.clientWidth]);
			}

			getWritableArticle(actualArticle.idPair).update(a => {
				for (const [i, ratio] of modifiedMedias)
					a.medias[i]!.ratio = ratio;
				return a;
			});
		}

		if (actualArticleProps.mediaIndex === null) {
			const count = actualArticle.medias.length;
			for (let i = 0; i < count; ++i) {
				if (actualArticle.medias[i]!.queueLoadInfo === MediaLoadType.LazyLoad && !actualArticle.medias[i]!.loaded) {
					if (mediaRefs[i]?.complete)
						loadingStore.mediaLoaded(actualArticle.idPair, i);
				}
			}
		}else {
			if (actualArticle.medias[actualArticleProps.mediaIndex]!.queueLoadInfo === MediaLoadType.LazyLoad && !actualArticle.medias[actualArticleProps.mediaIndex]!.loaded) {
				if (mediaRefs[actualArticleProps.mediaIndex]?.complete)
					loadingStore.mediaLoaded(actualArticle.idPair, actualArticleProps.mediaIndex);
			}
		}
	});

	onDestroy(() => {
		if (actualArticleProps.mediaIndex === null) {
			for (let i = 0; i < actualArticle.medias.length; ++i)
				loadingStore.remove(actualArticle.idPair, i);
		}else {
			loadingStore.remove(actualArticle.idPair, actualArticleProps.mediaIndex);
		}
	});

	//TODO Pass articleProps as arg
	function onLogData() {
		console.dir(articleProps);
	}

	function onLogJSON() {
		switch (articleProps.type) {
			case 'normal':
				console.dir({
					...articleProps,
					article: articleProps.article.rawSource,
				});
				break;
			case 'reposts':
				console.dir({
					...articleProps,
					reposted: getRootArticle(articleProps.reposted).rawSource,
				});
				break;
			case 'quote':
				console.dir({
					article: getRootArticle(articleProps).rawSource,
					quoted: getRootArticle(articleProps.quoted).rawSource,
				});
				break;
		}
	}

	function onMediaClick(idPair: ArticleIdPair, _index: number) {
		toggleMarkAsRead(idPair);
	}

	//TODO Find way to get specific parent soshalthing
	const modalMountElement = document.getElementsByClassName('soshalthing')[0] as HTMLDivElement;
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
	<Modal bind:active={modal} mountElement={modalMountElement}>
		<article class:transparent={articleProps.filteredOut}>
			<View
				{timelineProps}
				bind:modal
				{articleProps}
				{actualArticleProps}
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
	<View
		{timelineProps}
		bind:modal
		{articleProps}
		{actualArticleProps}
		{rootArticle}
		{actualArticle}
		{onLogData}
		{onLogJSON}
		{onMediaClick}
		bind:divRef
		bind:mediaRefs
		{loadingStates}
	/>
</article>