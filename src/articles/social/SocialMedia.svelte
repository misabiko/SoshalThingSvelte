<script lang='ts'>
	import type {ArticleIdPair, TimelineArticleProps} from '../index';
	import {getReadable, getWritable} from '~/services/service';
	import Fa from 'svelte-fa';
	import {faImages} from '@fortawesome/free-solid-svg-icons';
	import {type ArticleMedia, extensionToMediaType, MediaType} from '../media';
	import {LoadingState, loadingStore} from '~/bufferedMediaLoading';
	import {derived, type Readable} from 'svelte/store';
	import {faCirclePlay} from '@fortawesome/free-regular-svg-icons';
	import {tick} from 'svelte';

	export let idPair: ArticleIdPair;
	let article = getReadable(idPair);
	if ($article.medias.length === 0)
		throw {message: 'Article has no media', article: $article};
	export let mediaIndex: number | null = null;
	export let timelineProps: TimelineArticleProps;
	export let onMediaClick: (index: number) => void;
	let showAllMedia = derived(timelineProps.showAllMediaArticles, articles => articles.has($article.idPairStr));

	export let divRef: HTMLDivElement | null = null;
	export let mediaRefs: Record<number, HTMLImageElement | HTMLVideoElement> = [];
	export let loadingStates: Readable<Record<number, LoadingState>>;

	export let compact: boolean | null;

	tick().then(() => {
		const articleMediaEls = divRef?.querySelectorAll('.articleMedia:not(.articleThumbnail)');
		if (articleMediaEls) {
			const modifiedMedias: [number, number][] = [];
			for (let i = 0; i < $article.medias.length; ++i)
				if ($article.medias[i].ratio === null && articleMediaEls[i] !== undefined)
					modifiedMedias.push([i, articleMediaEls[i].clientHeight / articleMediaEls[i].clientWidth]);

			getWritable($article.idPair).update(a => {
				for (const [i, ratio] of modifiedMedias)
					a.medias[i].ratio = ratio;
				return a;
			});
		}
	});

	let medias: [ArticleMedia, number][];
	$: medias = mediaIndex === null
		? $article.medias.slice(0, !$showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : undefined)
			.map((m, i) => [m, i])
		: [[$article.medias[mediaIndex], mediaIndex]];

	let firstMediaExtension = $article.medias[0].src.split('.').at(-1);
	let isFakeGif = firstMediaExtension && $article.medias[0].mediaType === MediaType.Gif && extensionToMediaType(firstMediaExtension) === MediaType.Image;
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
		position: relative;
	}

	.socialMediaCompact .imagesHolder:not(.socialMediaFull), .socialMediaCompact video.articleMedia:not(.socialMediaFull) {
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
		align-self: flex-start;
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

	img.articleMediaLoading {
		position: absolute;
		left: 0;
		top: 0;
	}

	.fakeGifPlayButton {
		position: absolute;
		left: 50%;
		top: 50%;
		opacity: 0.5;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	:global(.fakeGifPlayButton > svg) {
		color: grey;
	}
</style>

<div class='socialMedia' class:socialMediaCompact='{compact ?? timelineProps.compact}' bind:this={divRef}>
	{#each medias as [media, index] (index)}
		{@const isLoading = $loadingStates[index] === LoadingState.Loading}
		{@const aspectRatio = 1 / (media.ratio ?? 1)}
		{#if $loadingStates[index] === LoadingState.NotLoaded}
			<div class='imagesHolder' class:socialMediaFull='{index < timelineProps.fullMedia}' style:aspect-ratio={aspectRatio}>
				<div class='imgPlaceHolder' style:aspect-ratio='{1 / (media.ratio ?? 1)}' style:display='none'></div>
				<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
				{#if media.thumbnail}
					<img
							class='articleMedia articleThumbnail'
							alt='{`${$article.idPairStr}/${index}`}'
							src={media.thumbnail.src}
							onclick='{() => onMediaClick(index)}'
					/>
				{/if}
			</div>
		{:else if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
			<div class='imagesHolder' class:socialMediaFull='{index < timelineProps.fullMedia}' style:aspect-ratio={aspectRatio}>
				<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
				<img
						class='articleMedia'
						alt='{`${$article.idPairStr}/${index}`}'
						src={media.src}
						onclick='{() => onMediaClick(index)}'
						bind:this={mediaRefs[index]}
						onload='{() => isLoading ? loadingStore.mediaLoaded($article.idPair, index) : undefined}'
						class:articleMediaLoading={isLoading}
				/>
				{#if isFakeGif}
					<div class='fakeGifPlayButton'>
						<Fa icon={faCirclePlay} size='6x'/>
					</div>
				{/if}
				{#if isLoading}
					{#if media.thumbnail}
						<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
						<img
								class='articleMedia articleThumb'
								alt='{`${$article.idPairStr}/${index}`}'
								src={media.thumbnail.src}
								onclick='{() => onMediaClick(index)}'
						/>
					{:else}
						<div class='imgPlaceHolder' style:aspect-ratio='{1 / (media.ratio ?? 1)}'></div>
					{/if}
				{/if}
			</div>
		{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<video
					class='articleMedia'
					class:socialMediaFull='{index < timelineProps.fullMedia}'
					controls
					preload='auto'
					muted={timelineProps.muteVideos}
					onclick='{e => {e.preventDefault(); onMediaClick(index)}}'
					bind:this={mediaRefs[index]}
			>
				<source src={media.src} type='video/mp4'/>
			</video>
		{:else if media.mediaType === MediaType.VideoGif || timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<video
					class='articleMedia'
					class:socialMediaFull='{index < timelineProps.fullMedia}'
					controls
					autoplay
					loop
					muted
					preload='auto'
					onclick='{e => {e.preventDefault(); onMediaClick(index)}}'
					bind:this={mediaRefs[index]}
			>
				<source src={media.src} type='video/mp4'/>
			</video>
		{/if}
	{/each}
</div>
{#if !$showAllMedia && timelineProps.maxMediaCount !== null && $article.medias.length > timelineProps.maxMediaCount}
	<div class='moreMedia'>
		<button class='borderless-button' title='Load more medias' onclick='{() => timelineProps.showAllMediaArticles.update(a => {a.add($article.idPairStr); return a;})}'>
			<Fa icon={faImages} size='2x'/>
		</button>
	</div>
{/if}