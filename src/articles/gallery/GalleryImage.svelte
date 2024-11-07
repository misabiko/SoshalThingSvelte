<script lang='ts'>
	import {type ArticleMedia, extensionToMediaType, MediaType} from '../media';
	import type {ArticleIdPair} from '../index';
	import Article from '../index';
	import {loadingStore} from '~/bufferedMediaLoading';
	import GalleryThumbnail from './GalleryThumbnail.svelte';
	import {faCirclePlay} from '@fortawesome/free-regular-svg-icons';
	import Fa from 'svelte-fa';

	let {
		actualArticle,
		mediaIndex,
		media,
		onMediaClick,
		isLoading,
		ref = $bindable(),
	}: {
		actualArticle: Readonly<Article>
		mediaIndex: number
		media: ArticleMedia
		onMediaClick: (idPair: ArticleIdPair, index: number) => void
		isLoading: boolean
		ref: HTMLImageElement | HTMLVideoElement
	} = $props();

	const cropped = !!(media.offsetX ?? media.offsetY);

	let firstMediaExtension = media.src.split('.').at(-1);
	let isFakeGif = firstMediaExtension && media.mediaType === MediaType.Gif && extensionToMediaType(firstMediaExtension) === MediaType.Image;
</script>

<style>
	img {
		width: 100%;
	}

	img.articleMediaLoading {
		position: absolute;
		left: 0;
		top: 0;
	}

	.articleMediaCrop {
		overflow-y: hidden;
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

{#if cropped}
	<div class='articleMediaCrop' style:aspect-ratio={`${media.cropRatio}`}>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<img
			alt={`${actualArticle.idPair.id}/${mediaIndex}`}
			class='articleMedia'
			src={media.src}
			onclick={() => onMediaClick(actualArticle.idPair, mediaIndex)}
			onload={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, mediaIndex) : undefined}
			class:articleMediaLoading={isLoading}
			bind:this={ref}
			style:object-fit={'cover'}
			style:object-position={`${media.offsetX ?? 0} ${media.offsetY ?? 0}`}
			style:aspect-ratio={`1 / ${media.ratio}`}
			style:width={'100%'}
		/>
		{#if isLoading}
			<GalleryThumbnail
				{actualArticle}
				mediaIndex={mediaIndex}
				{media}
				{onMediaClick}
			/>
		{/if}
		{#if isFakeGif}
			<div class='fakeGifPlayButton'>
				<Fa icon={faCirclePlay} size='6x'/>
			</div>
		{/if}
	</div>
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
	<img
		alt={`${actualArticle.idPair.id}/${mediaIndex}`}
		class='articleMedia'
		src={media.src}
		onclick={() => onMediaClick(actualArticle.idPair, mediaIndex)}
		onload={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, mediaIndex) : undefined}
		class:articleMediaLoading={isLoading}
		bind:this={ref}
	/>
	{#if isLoading}
		<GalleryThumbnail
				{actualArticle}
				mediaIndex={mediaIndex}
				{media}
				{onMediaClick}
		/>
	{/if}
	{#if isFakeGif}
		<Fa icon={faCirclePlay} size='2x' class='fakeGifPlayButton'/>
	{/if}
{/if}