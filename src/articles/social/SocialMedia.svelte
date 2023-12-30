<script lang='ts'>
	import type {TimelineArticleProps} from '../index';
	import Article from '../index';
	import {afterUpdate} from 'svelte';
	import {getWritable} from '~/services/service';
	import Fa from 'svelte-fa';
	import {faImages} from '@fortawesome/free-solid-svg-icons';
	import {MediaType} from '../media';
	import {LoadingState} from '~/bufferedMediaLoading';

	export let article: Article;
	export let timelineProps: TimelineArticleProps;
	export let showAllMedia: boolean;
	export let onMediaClick: (index: number) => void;

	export let divRef: HTMLDivElement | null = null;
	export let mediaRefs: (HTMLImageElement | HTMLVideoElement)[] = [];
	export let loadingStates: LoadingState[] | null = null;

	export let compact: boolean | null;
	//TODO Add option for full first (n) media and compact rest

	afterUpdate(() => {
		const articleMediaEls = divRef?.querySelectorAll('.articleMedia:not(.articleThumbnail)');
		if (articleMediaEls) {
			const modifiedMedias: [number, number][] = [];
			for (let i = 0; i < article.medias.length; ++i)
				if (article.medias[i].ratio === null && articleMediaEls[i] !== undefined)
					modifiedMedias.push([i, articleMediaEls[i].clientHeight / articleMediaEls[i].clientWidth]);

			getWritable(article.idPair).update(a => {
				for (const [i, ratio] of modifiedMedias)
					a.medias[i].ratio = ratio;
				return a;
			});
		}
	});

	//Sloppy to make sure landscape single images aren't forced to square aspect ratio
	let aspectRatio: number | undefined;
	$: if ((compact ?? timelineProps.compact) && article.medias.length === 1 && (article.medias[0].ratio ?? 1) < 1) {
		aspectRatio = 1 / (article.medias[0]?.ratio ?? 1);
	}
	let aspectRatioThumbnail: number | undefined;
	$: if ((compact ?? timelineProps.compact) && article.medias.length === 1 && (article.medias[0].thumbnail?.ratio ?? 1) < 1) {
		aspectRatioThumbnail = 1 / (article.medias[0]?.thumbnail?.ratio ?? 1);
	}
</script>

<style>
	.socialMedia {
		margin-top: 1rem;
	}

	.socialMedia.socialMediaCompact {
		display: flex;
		flex-wrap: wrap;
	}

	.socialMedia video {
		width: 100%;
		border-radius: 8px;
	}

	.imagesHolder {
		overflow: hidden;
		display: flex;
		justify-content: center;
		border-radius: 8px;
	}

	.socialMediaCompact .imagesHolder, .socialMediaCompact video.articleMedia {
		width: 50%;
		aspect-ratio: 1;
	}

	.socialMediaCompact .imagesHolder:only-child, .socialMediaCompact video.articleMedia:only-child {
		width: 100%;
	}

	.imagesHolder:not(:last-child) {
		margin-bottom: 2px;
	}

	.imagesHolder img {
		align-self: center;
		width: 100%;
	}

	.imgPlaceHolder {
		width: 100%;
		background-color: grey;
	}

	.moreMedia {
		display: flex;
		width: 100%;
	}
	.moreMedia > button {
		margin-left: auto;
		margin-right: auto;
		padding-top: 5px;
	}
</style>

<div class='socialMedia' class:socialMediaCompact={compact ?? timelineProps.compact} bind:this={divRef}>
	{#each article.medias.slice(0, !showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : undefined) as media, index (index)}
		<!--{@const isLoading = loadingStates && loadingStates[index] === LoadingState.Loading}-->
		{#if loadingStates && loadingStates[index] === LoadingState.NotLoaded}
			<div class='imagesHolder' style:aspect-ratio={aspectRatioThumbnail}>
				<div class='imgPlaceHolder' style:aspect-ratio={1 / (media.ratio ?? 1)} style:display='none'></div>
				<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
				{#if media.thumbnail}
					<img
							class='articleMedia articleThumbnail'
							alt={`${article.idPairStr}/${index}`}
							src={media.thumbnail.src}
							on:click={() => onMediaClick(index)}
					/>
				{/if}
			</div>
		{:else if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
			<div class='imagesHolder' style:aspect-ratio={aspectRatio}>
				<div class='imgPlaceHolder' style:aspect-ratio={1 / (media.ratio ?? 1)} style:display='none'></div>
				<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
				<img
						class='articleMedia'
						alt={`${article.idPairStr}/${index}`}
						src={media.src}
						on:click={() => onMediaClick(index)}
						bind:this={mediaRefs[index]}
				/>
			</div>
		{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<video
					class='articleMedia'
					controls
					preload='auto'
					muted={timelineProps.muteVideos}
					on:click|preventDefault={() => onMediaClick(index)}
					bind:this={mediaRefs[index]}
			>
				<source src={media.src} type='video/mp4'/>
			</video>
		{:else if media.mediaType === MediaType.VideoGif || timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<video
					class='articleMedia'
					controls
					autoplay
					loop
					muted
					preload='auto'
					on:click|preventDefault={() => onMediaClick(index)}
					bind:this={mediaRefs[index]}
			>
				<source src={media.src} type='video/mp4'/>
			</video>
		{/if}
	{/each}
	{#if !showAllMedia && timelineProps.maxMediaCount !== null && article.medias.length > timelineProps.maxMediaCount}
		<div class='moreMedia'>
			<button class='borderless-button' title='Load more medias' on:click={() => showAllMedia = true}>
				<Fa icon={faImages} size='2x'/>
			</button>
		</div>
	{/if}
</div>