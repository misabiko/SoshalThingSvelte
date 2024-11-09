<script lang='ts'>
	import Fa from 'svelte-fa';
	import {
		faEllipsisH, faExpandAlt, faSpinner, faGripVertical, faEllipsisVertical, faUpRightFromSquare,
	} from '@fortawesome/free-solid-svg-icons';
	import Dropdown from '../../Dropdown.svelte';
	import Article, { type ArticleIdPair } from '../../articles';
	import type { TimelineArticleProps } from '../index';
	import { getReadableArticle, getService } from '~/services/service';
	import { type ArticleAction, getGenericActions } from '~/services/actions';
	import { SvelteSet } from 'svelte/reactivity';

	let {
		idPair,
		repost = null,
		isQuoted = false,
		modal = $bindable(),
		timelineProps,
		onLogData,
		onLogJSON,

		compact = $bindable(),
	}: {
		idPair: ArticleIdPair
		repost?: Article | null
		isQuoted?: boolean
		modal: boolean
		timelineProps: TimelineArticleProps
		onLogData: () => void
		onLogJSON: () => void

		compact: boolean | null
	} = $props();

	let article = getReadableArticle(idPair);

	const genericActions = getGenericActions($article);
	genericActions.push({
		action: () => compact = !(compact ?? timelineProps.compact),
		actionedName: 'Show expanded',
		actioned: () => compact ?? timelineProps.compact,
		togglable: true,
		actionedIcon: faEllipsisVertical,
		key: 'toggleCompact',
		name: 'Show compact',
		disabled: null,
		icon: faGripVertical,
		color: null,
		count: null,
		index: 5,
		views: {
			default: {
				listAsIcon: false,
				listAsDropdown: true,
			},
		},
	});

	if (repost?.url)
		genericActions.push({
			href: repost.url,
			key: 'repostExternalLink',
			name: 'Repost\'s external Link',
			icon: faUpRightFromSquare,
			color: null,
			count: null,
			index: 7,
			views: {
				default: {
					listAsIcon: false,
					listAsDropdown: true,
				},
			},
		});

	//TODO Have option to move icon actions to dropdown
	let actions: [ArticleAction[], ArticleAction[]] = [...Object.values(getService(idPair.service).articleActions), ...genericActions]
		.sort((a, b) => a.index - b.index)
		.reduce<[ArticleAction[], ArticleAction[]]>(([icons, dropdown], action) => {
			if (action.views.SocialArticleView?.listAsIcon ?? action.views.default.listAsIcon)
				icons.push(action);
			if (action.views.SocialArticleView?.listAsDropdown ?? action.views.default.listAsDropdown)
				dropdown.push(action);
			return [icons, dropdown];
		}, [[], []]);

	const hoveredActions = new SvelteSet<string>();

	function updateActionHover(key: string, hovered: boolean) {
		if (hovered)
			hoveredActions.add(key);
		else
			hoveredActions.delete(key);
	}

	let status: string | null = null;
</script>

<style>
	nav {
		display: flex;
		justify-content: space-between;
	}

	nav > div {
		display: flex;
		gap: 0.5rem;
	}

	nav > div:not(:first-child) {
		justify-content: flex-end;
	}

	.articleButton {
		color: var(--light);
		font-size: unset;
	}

	.articleButton:focus {
		outline: none;
	}

	.articleButton:hover span {
		color: var(--primary);
	}

	:global(button.articleButton.borderless-button.actioned > span > svg) {
		color: var(--primary);
	}

	button:disabled {
		cursor: unset;
	}
</style>

<nav>
	<div>
		{#each actions[0] as action (action.key)}
			{#if action.icon}
				{#if action.action}
					{@const actionFunc = action.action}
					{@const count = action.count ? action.count($article) ?? 0 : 0}
					{@const disabled = action.disabled ? action.disabled($article) : false}
					{@const actioned = action.actioned($article)}
					{@const isHovered = hoveredActions.has(action.key)}
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<button
							class='articleButton borderless-button'
							class:actioned
							title={action.name}
							onclick={() => actionFunc(idPair)}
							disabled={disabled || (actioned && !action.togglable)}
							onmouseover={() => updateActionHover(action.key, true)}
							onmouseout={() => updateActionHover(action.key, false)}
					>
						<span class='icon'>
							<Fa
									icon={action.actionedIcon && actioned ? action.actionedIcon : action.icon}
									color={action.color && !disabled && (actioned || isHovered) ? action.color : undefined}
							/>
						</span>
						{#if count}
							<span style:color={!disabled && (actioned || isHovered) ? action.color : 'inherit'}>{count}</span>
						{/if}
					</button>
				{:else}
					{@const count = action.count ? action.count($article) ?? 0 : 0}
					{@const isHovered = hoveredActions.has(action.key)}
					<!-- svelte-ignore a11y_mouse_events_have_key_events -->
					<a
							class='articleButton borderless-button'
							title={action.name}
							href={action.href}
							onmouseover={() => updateActionHover(action.key, true)}
							onmouseout={() => updateActionHover(action.key, false)}
					>
						<span class='icon'>
							<Fa
									icon={action.icon}
									color={isHovered ? action.color ?? undefined : undefined}
							/>
						</span>
						{#if count}
							<span style:color={isHovered ? action.color ?? undefined : 'inherit'}>{count}</span>
						{/if}
					</a>
				{/if}
			{/if}
		{/each}
		{#if !isQuoted && !modal}
			<button
					class='articleButton borderless-button'
					title='Expand article as modal'
					onclick={() => modal = true}
			>
				<span class='icon'>
					<Fa icon={faExpandAlt}/>
				</span>
			</button>
		{/if}
		<Dropdown labelClasses='articleButton borderless-button'>
			{#snippet triggerIcon()}
				<span class='icon'>
					<Fa icon={faEllipsisH}/>
				</span>
			{/snippet}

			{#each actions[1] as action (action.key)}
				{#if action.action}
					{@const actionFunc = action.action}
					{@const count = action.count ? action.count($article) ?? 0 : 0}
					{@const disabled = action.disabled ? action.disabled($article) : false}
					{@const actioned = action.actioned($article)}
					<button
							class='dropdown-item'
							onclick={() => actionFunc(idPair)}
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
			{#if !isQuoted}
				<button class='dropdown-item' onclick={onLogData}>
					Log Data
				</button>
				<button class='dropdown-item' onclick={onLogJSON}>
					Log Json Data
				</button>
			{/if}
		</Dropdown>
	</div>
	{#if status !== null}
		<div class='level-right'>
			<button title={status}>
				<span class='icon'>
					<Fa icon={faSpinner}/>
				</span>
			</button>
		</div>
	{/if}
</nav>