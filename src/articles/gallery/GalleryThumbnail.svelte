<script lang='ts'>
	import type {ArticleMedia} from '../media';
	import type {ArticleIdPair} from '../index';
	import Article from '../index';

	let {
		actualArticle,
		mediaIndex,
		media,
		onMediaClick,
	}: {
		actualArticle: Readonly<Article>
		mediaIndex: number
		media: ArticleMedia
		onMediaClick: (idPair: ArticleIdPair, index: number) => void
	} = $props();

	const cropped = !!(media.thumbnail?.offsetX ?? media.thumbnail?.offsetY);
</script>

<style>
	img {
		width: 100%;
	}

	.articleThumb {
		z-index: -1;
	}

	.articleMediaCrop {
		overflow-y: hidden;
	}

	.imgPlaceHolder {
		width: 100%;
		background-color: grey;
	}
</style>

{#if media.thumbnail}
	{#if cropped}
		<div class='articleMediaCrop' style:aspect-ratio={`${media.thumbnail.cropRatio}`}>
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<img
				alt={`${actualArticle.idPair.id}/${mediaIndex} thumbnail`}
				class='articleThumb articleMedia'
				src={media.thumbnail.src}
				onclick={() => onMediaClick(actualArticle.idPair, mediaIndex)}
				style:object-fit={'cover'}
				style:object-position={`${media.thumbnail.offsetX ?? 0} ${media.thumbnail.offsetY ?? 0}`}
				style:aspect-ratio={`1 / ${media.thumbnail.ratio}`}
				style:width={'100%'}
			/>
		</div>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<img
			alt={`${actualArticle.idPair.id}/${mediaIndex} thumbnail`}
			class='articleThumb articleMedia'
			src={media.thumbnail.src}
			onclick={() => onMediaClick(actualArticle.idPair, mediaIndex)}
		/>
	{/if}
{:else}
	<div class='imgPlaceHolder' style:aspect-ratio={1 / (media.ratio ?? 1)}></div>
{/if}