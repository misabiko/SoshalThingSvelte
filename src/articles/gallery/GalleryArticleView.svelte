<script lang='ts'>
	import type {ArticleViewProps} from '../index';
	import Fa from 'svelte-fa';
	import {
		faExpandArrowsAlt,
		faExternalLinkAlt,
		faEllipsisH, faImages,
	} from '@fortawesome/free-solid-svg-icons';
	import {LoadingState, loadingStore} from '~/bufferedMediaLoading';
	import Dropdown from '~/Dropdown.svelte';
	import {getService} from '~/services/service';
	import {MediaType, type ArticleMedia} from '../media';
	import GalleryThumbnail from './GalleryThumbnail.svelte';
	import GalleryImage from './GalleryImage.svelte';
	import {type ArticleAction, getGenericActions} from '~/services/actions';

	let {
		timelineProps,
		articleProps: _articleProps,
		actualArticleProps,
		modal = $bindable(),
		rootArticle,
		actualArticle,
		onMediaClick,
		onLogData,
		onLogJSON,

		divRef = $bindable(),
		mediaRefs = $bindable(),
		loadingStates = $bindable(),
	}: ArticleViewProps = $props();
	let showAllMediaArticles = $derived(timelineProps.showAllMediaArticles);
	let showAllMedia = $derived($showAllMediaArticles.has(rootArticle.idPairStr));

	let actions: [ArticleAction[], ArticleAction[]] = [...Object.values(getService(rootArticle.idPair.service).articleActions), ...getGenericActions(rootArticle)]
		.sort((a, b) => a.index - b.index)
		.reduce<[ArticleAction[], ArticleAction[]]>(([icons, dropdown], action) => {
			if (action.views.GalleryArticleView?.listAsIcon ?? action.views.default.listAsIcon)
				icons.push(action);
			if (action.views.GalleryArticleView?.listAsDropdown ?? action.views.default.listAsDropdown)
				dropdown.push(action);
			return [icons, dropdown];
		}, [[], []]);

	let medias: [ArticleMedia, number][] = $derived(actualArticleProps.mediaIndex === null
		? actualArticle.medias.slice(0, !showAllMedia && timelineProps.maxMediaCount !== null ? timelineProps.maxMediaCount : undefined)
			.map((m, i) => [m, i])
		: [[actualArticle.medias[actualArticleProps.mediaIndex]!, actualArticleProps.mediaIndex]]);
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
		display: none;
		direction: ltr;
		pointer-events: none;
		z-index: 1;
	}

	.holderBox > .button, :global(.holderBox .dropdown-trigger .button) {
		opacity: 0.5;
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
		{#each medias as [media, i] (i)}
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
						bind:ref={mediaRefs[i]!}
				/>
			{:else if !timelineProps.animatedAsGifs && media.mediaType === MediaType.Video}
				<video
					class='articleMedia'
					controls
					preload='auto'
					muted={timelineProps.muteVideos}
					onclick={e => {e.preventDefault(); onMediaClick(actualArticle.idPair, i);}}
					onloadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					onload={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
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
					onclick={e => {e.preventDefault(); onMediaClick(actualArticle.idPair, i);}}
					onloadeddata={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
					onload={() => isLoading ? loadingStore.mediaLoaded(actualArticle.idPair, i) : undefined}
				>
					<source src={media.src} type='video/mp4'/>
				</video>
			{/if}
		{/each}
		{#if !showAllMedia && timelineProps.maxMediaCount !== null && actualArticle.medias.length > timelineProps.maxMediaCount}
			<div class='moreMedia'>
				<button class='borderless-button' title='Load more medias' onclick={() => timelineProps.showAllMediaArticles.update(a => {a.add(rootArticle.idPairStr); return a;})}>
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
				<button class='button' onclick={() => modal = !modal}>
					<span class='icon darkIcon'>
						<Fa icon={faExpandArrowsAlt} class='is-small'/>
					</span>
				</button>
			{/if}

			<Dropdown isRight={true} labelClasses='articleButton'>
				{#snippet triggerIcon()}
					<span class='icon darkIcon'>
						<Fa icon={faEllipsisH} class='level-item'/>
					</span>
				{/snippet}

				{#each actions[1] as action (action.key)}
					{#if action.action}
						{@const actionFunc = action.action}
						{@const count = action.count ? action.count(rootArticle) ?? 0 : 0}
						{@const disabled = action.disabled ? action.disabled(rootArticle) : false}
						{@const actioned = action.actioned(rootArticle)}
						<button
								class='dropdown-item'
								onclick={() => actionFunc(rootArticle.idPair)}
								disabled={disabled || (actioned && !action.togglable)}
						>
							{#if action.actionedName && actioned}
								{action.actionedName}
							{:else}
								{action.name}
							{/if}
							{#if count}
								<span>{count}</span>
							{/if}
						</button>
					{:else}
						<a
								class='dropdown-item'
								href={action.href}
								target='_blank'
								rel='noreferrer'
						>
							{action.name}
						</a>
					{/if}
				{/each}
				<button class='dropdown-item' onclick={onLogData}>
					Log Data
				</button>
				<button class='dropdown-item' onclick={onLogJSON}>
					Log JSON Data
				</button>
			</Dropdown>
		</div>
		<div class='holderBox holderBoxBottom'>
			{#each actions[0] as action (action.key)}
				{#if action.icon}
					{#if action.action}
						{@const actionFunc = action.action}
						{@const actioned = action.actioned(rootArticle)}
						{@const disabled = action.disabled ? action.disabled(rootArticle) : false}
						{#if !actioned || action.togglable}
							<button
								class='button'
								class:actioned
								title={action.name}
								onclick={() => actionFunc(rootArticle.idPair)}
								{disabled}
							>
								<span class='icon darkIcon'>
									<Fa icon={action.actionedIcon && actioned ? action.actionedIcon : action.icon} class='is-small'/>
								</span>
							</button>
						{/if}
					{:else}
						<a
							class='button'
							title={action.name}
							href={action.href}
						>
							<span class='icon darkIcon'>
								<Fa icon={action.icon} class='is-small'/>
							</span>
						</a>
					{/if}
				{/if}
			{/each}
		</div>
	</div>
</div>