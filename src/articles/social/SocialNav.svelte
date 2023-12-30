<script lang='ts'>
	import Fa from 'svelte-fa'
	import {
		faEyeSlash,
		faEllipsisH, faExpandAlt, faEye, faSpinner, faGripVertical, faEllipsisVertical, faUpRightFromSquare,
	} from '@fortawesome/free-solid-svg-icons';
	import Dropdown from '../../Dropdown.svelte'
	import {toggleMarkAsRead} from "../../services/service"
	import Article, {type ArticleIdPair} from '../../articles';
	import type {TimelineArticleProps} from '../index'
	import {getServices} from "../../services/service";
	import {type ArticleAction, getUniversalActions} from '../../services/actions';

	export let article: Article
	export let repost: Article | null = null
	export let isQuoted = false
	export let modal: boolean
	export let timelineProps: TimelineArticleProps
	export let onLogData: () => void
	export let onLogJSON: () => void

	export let compact: boolean | null;

	const universalActions = getUniversalActions(article);
	universalActions.push({
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
		listAsIcon: false,
		listAsDropdown: true,
	});

	if (repost?.url)
		universalActions.push({
			href: repost.url,
			key: 'repostExternalLink',
			name: "Repost's external Link",
			icon: faUpRightFromSquare,
			color: null,
			count: null,
			index: 7,
			listAsIcon: true,
			listAsDropdown: false,
		});

	//TODO Have option to move icon actions to dropdown
	let actions: [ArticleAction[], ArticleAction[]] = [...Object.values(getServices()[article.idPair.service].articleActions), ...universalActions]
		.filter(a => a.icon !== null)
		.sort((a, b) => a.index - b.index)
		.reduce(([icons, dropdown], action) => {
			if (action.listAsIcon)
				icons.push(action);
			if (action.listAsDropdown)
				dropdown.push(action);
			return [icons, dropdown];
		}, [[], []] as [ArticleAction[], ArticleAction[]]);

	let hoveredActions = new Set<string>()
	function updateActionHover(key: string, hovered: boolean) {
		if (hovered)
			hoveredActions.add(key)
		else
			hoveredActions.delete(key)

		hoveredActions = hoveredActions
	}

	let status: string | null = null
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
			{#if action.action}
				{@const actionFunc = action.action}
				{@const count = action.count ? action.count(article) : 0}
				{@const disabled = action.disabled ? action.disabled(article) : false}
				{@const actioned = action.actioned(article)}
				{@const isHovered = hoveredActions.has(action.key)}
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<button
					class='articleButton borderless-button'
					class:actioned
					title={action.name}
					on:click={() => actionFunc(article.idPair)}
					disabled={disabled || (actioned && !action.togglable)}
					on:mouseover={() => updateActionHover(action.key, true)}
					on:mouseout={() => updateActionHover(action.key, false)}
				>
					<span class='icon'>
						<Fa
							icon={action.actionedIcon && actioned ? action.actionedIcon : action.icon}
							color={!disabled && (actioned || isHovered) ? action.color : undefined}
						/>
					</span>
					{#if count}
						<span style:color={!disabled && (actioned || isHovered) ? action.color : 'inherit'}>{count}</span>
					{/if}
				</button>
			{:else}
				{@const count = action.count ? action.count(article) : 0}
				{@const isHovered = hoveredActions.has(action.key)}
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				<a
						class='articleButton borderless-button'
						title={action.name}
						href={action.href}
						on:mouseover={() => updateActionHover(action.key, true)}
						on:mouseout={() => updateActionHover(action.key, false)}
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
		{/each}
		{#if !isQuoted && !modal}
			<button
				class='articleButton borderless-button'
				title='Expand article as modal'
				on:click={() => modal = true}
			>
				<span class='icon'>
					<Fa icon={faExpandAlt}/>
				</span>
			</button>
		{/if}
		<Dropdown labelClasses='articleButton borderless-button'>
			<span slot='triggerIcon' class='icon'>
				<Fa icon={faEllipsisH}/>
			</span>

			{#each actions[1] as action (action.key)}
				{#if action.action}
					{@const actionFunc = action.action}
					{@const count = action.count ? action.count(article) : 0}
					{@const disabled = action.disabled ? action.disabled(article) : false}
					{@const actioned = action.actioned(article)}
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<button
							class='dropdown-item'
							on:click={() => actionFunc(article.idPair)}
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
				<button class='dropdown-item' on:click={onLogData}>
					Log Data
				</button>
				<button class='dropdown-item' on:click={onLogJSON}>
					Log Json Data
				</button>
				<!--	<button class='dropdown-item'>-->
				<!--		Fetch Data-->
				<!--	</button>-->
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