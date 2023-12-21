<script lang='ts'>
	import Article from '../index'
	import type {ArticleIdPair} from '../index'
	import Fa from 'svelte-fa'
	import {
		faExpandArrowsAlt,
		faExternalLinkAlt,
		faEllipsisH, faImages,
	} from '@fortawesome/free-solid-svg-icons'
	import {LoadingState, loadingStore} from '../../bufferedMediaLoading'
	import Dropdown from "../../Dropdown.svelte"
	import {
		fetchArticle,
		toggleMarkAsRead,
		getServices,
	} from "../../services/service"
	import type {TimelineArticleProps} from '../index'
	import type {ArticleProps} from '../index'
	import {MediaType} from '../media'
	import GalleryThumbnail from "./GalleryThumbnail.svelte";
	import GalleryImage from "./GalleryImage.svelte";

	export let timelineProps: TimelineArticleProps
	export let articleProps: ArticleProps; articleProps;
	export let style = ''; style;
	export let modal: boolean; modal;
	export let showAllMedia: boolean;
	export let rootArticle: Readonly<Article>; rootArticle;
	export let actualArticle: Readonly<Article>
	export let onMediaClick: (idPair: ArticleIdPair, index: number) => number
	export let onLogData: () => void
	export let onLogJSON: () => void

	export let divRef: HTMLDivElement | null;
	export let mediaRefs: HTMLImageElement[];
	export let loadingStates: LoadingState[];

	let actions = Object.values(getServices()[rootArticle.idPair.service].articleActions)
		.filter(a => a.icon !== undefined)
		.sort((a, b) => a.index - b.index)
</script>

<style>
	.galleryArticle {
		padding: 0;
		margin-bottom: 0;
	}

	.galleryArticle > div {
		position: relative;
	}

	.galleryArticle:hover .holderBox {
		display: flex;
	}

	video {
		width: 100%;
	}

	.holderBox {
		justify-content: space-between;
		flex-wrap: nowrap;
		position: absolute;
		height: 56px;
		width: 100%;
		opacity: 0.5;
		display: none;
		direction: ltr;
		pointer-events: none;
	}

	.holderBox > * {
		height: inherit;
		padding-top: unset;
		padding-bottom: unset;
	}

	.holderBox :global(.dropdown-trigger), .holderBox :global(.dropdown-trigger > button) {
		height: 100%;
	}

	.holderBox :global(*) {
		pointer-events: auto;
	}

	/* Hack */
	.holderBox :global(.dropdown-content) {
		overflow-x: hidden;
	}

	.holderBoxTop {
		top: 0;
	}

	.holderBoxBottom {
		bottom: 0;
		justify-content: space-around;
	}

	.moreMedia {
		display: flex;
	}
	.moreMedia > button {
		margin-left: auto;
		margin-right: auto;
		padding-top: 5px;
	}
</style>

<div class='galleryArticle' bind:this={divRef}>
	<div>
		{#each actualArticle.medias.slice(0, !showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : undefined) as media, i (i)}
			{@const isLoading = loadingStates[i] === LoadingState.Loading}
			{#if loadingStates[i] === LoadingState.NotLoaded}
				<GalleryThumbnail
						{actualArticle}
						mediaIndex={i}
						{media}
						{onMediaClick}
				/>
			{:else if media.mediaType === MediaType.Image || media.mediaType === MediaType.Gif}
				<GalleryImage
						{actualArticle}
						mediaIndex={i}
						{media}
						{onMediaClick}
						{isLoading}
						ref={mediaRefs[i]}
				/>
			{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
				<!-- svelte-ignore a11y-media-has-caption -->
				<video
					class='articleMedia'
					controls
					preload='auto'
					on:click|preventDefault={() => onMediaClick(actualArticle.idPair, i)}
					on:loadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
				>
					<source src={media.src} type='video/mp4'/>
				</video>
			{:else}
				<video
					class='articleMedia'
					controls
					autoplay
					loop
					muted
					preload='auto'
					on:click|preventDefault={() => onMediaClick(actualArticle.idPair, i)}
					on:loadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					on:load={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
				>
					<source src={media.src} type='video/mp4'/>
				</video>
			{/if}
		{/each}
		{#if !showAllMedia && timelineProps.maxMediaCount !== null && actualArticle.medias.length > timelineProps.maxMediaCount}
			<div class='moreMedia'>
				<button class='borderless-button' title='Load more medias' on:click={() => showAllMedia = true}>
					<Fa icon={faImages} size='2x'/>
				</button>
			</div>
		{/if}
		<div class='holderBox holderBoxTop'>
			<a class='button' title='External Link' href={actualArticle.url}>
				<span class='icon darkIcon'>
					<Fa icon={faExternalLinkAlt} class='is-small'/>
				</span>
			</a>
			{#if !modal}
				<button class='button' on:click={() => modal = !modal}>
					<span class='icon darkIcon'>
						<Fa icon={faExpandArrowsAlt} class='is-small'/>
					</span>
				</button>
			{/if}

			<Dropdown isRight={true} labelClasses='articleButton'>
				<!--on_expanded_change={ctx.link().callback(Msg::SetDrawOnTop)}-->
				<span slot='triggerIcon' class='icon darkIcon'>
					<Fa icon={faEllipsisH} class='level-item'/>
				</span>
				<button class='dropdown-item' on:click={() => toggleMarkAsRead(actualArticle.idPair)}>
					Mark as read
				</button>
				{#if actualArticle.medias.some(m => !m.loaded) }
					<button
						class='dropdown-item'
						on:click={() => {for (let i = 0; i < actualArticle.medias.length; ++i) loadingStore.forceLoading(actualArticle, i)}}
					>
						Load Media
					</button>
				{/if}
				<a
					class='dropdown-item'
					href={ actualArticle.url }
				>
					External Link
				</a>
				<button class='dropdown-item' on:click={onLogData}>
					Log Data
				</button>
				<button class='dropdown-item' on:click={onLogJSON}>
					Log JSON Data
				</button>
				{#if !actualArticle.fetched }
					<button class='dropdown-item' on:click={() => fetchArticle(actualArticle.idPair)}>
						Fetch Article
					</button>
				{/if}
			</Dropdown>
		</div>
		<div class='holderBox holderBoxBottom'>
			{#each actions as action (action.key)}
				{@const actioned = action.actioned(rootArticle)}
				{@const disabled = action.disabled ? action.disabled(rootArticle) : false}
				{#if !actioned || action.togglable}
					<button
						class='button'
						class:actioned
						title={action.name}
						on:click={() => action.action(rootArticle.idPair)}
						{disabled}
					>
						<span class='icon darkIcon'>
							<Fa icon={action.actionedIcon && actioned ? action.actionedIcon : action.icon} class='is-small'/>
						</span>
					</button>
				{/if}
			{/each}
		</div>
	</div>
</div>