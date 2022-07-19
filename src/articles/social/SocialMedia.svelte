<script lang='ts'>
	import Article from '../../services/article'
	import {MediaType} from "../../services/article.js";
	import type {TimelineArticleProps} from '../index'

	export let article: Article
	export let timelineProps: TimelineArticleProps
	export let onMediaClick: (index: number) => void
</script>

<style lang='sass'>
	.postMedia
		margin-top: 1rem

	.postVideo video
		width: 100%

	//TODO .postImagesCompact
	//	display: flex
	//	flex-wrap: wrap

	.mediaHolder
		overflow: hidden
		display: flex
		justify-content: center
		border-radius: 8px

		&:not(:last-child)
			margin-bottom: 2px

		img
			align-self: center
			width: 100%

	//&.mediaHolderCompact
	//	max-height: 16vh
	//	width: 100%
	//
	//	&:not(:only-child)
	//		margin: 2px
	//		max-width: 49%
	//
	//		&.landscape img
	//			width: unset
	//			height: 110%
	//
	//		&.portrait img
	//			width: 110%
	//			height: unset
	//
	//	img
	//		object-fit: cover
	//
	//	&.thirdImage
	//		max-width: unset
	//
	//		&.landscape img
	//			width: unset
	//			height: 175%
	//
	//		&.portrait img
	//			width: 175%
	//			height: unset

	.imgPlaceHolder
		width: 100%
		background-color: grey
</style>

<div class='postMedia postImages'>
	{#each article.medias as media, index (index)}
		{#if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
			<div class='mediaHolder'>
				<div class='is-hidden imgPlaceHolder' style:aspect-ratio={1 / media.ratio}></div>
				<img alt={article.id} src={media.src} on:click={() => onMediaClick(index)}/>
			</div>
		{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<div class='postMedia postVideo'>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video controls on:click|preventDefault={() => onMediaClick(index)}>
					<source src={media.src} type='video/mp4'/>
				</video>
			</div>
		{:else if media.mediaType === MediaType.VideoGif || timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
			<div class='postMedia postVideo'>
				<!-- svelte-ignore a11y-media-has-caption -->
				<video controls autoplay loop muted on:click|preventDefault={() => onMediaClick(index)}>
					<source src={media.src} type='video/mp4'/>
				</video>
			</div>
		{/if}
	{/each}
</div>