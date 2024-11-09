<script lang='ts'>
	import Fa from 'svelte-fa';
	import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
	import { onMount, type Snippet } from 'svelte';

	let {
		children,
		triggerIcon,
		isActive = false,
		isRight = false,
		triggerClasses = '',
		labelClasses = '',
		labelText = '',
	}: {
		children: Snippet
		triggerIcon?: Snippet
		isActive?: boolean
		isRight?: boolean
		triggerClasses?: string
		labelClasses?: string
		labelText?: string
	} = $props();

	let triggerRef: HTMLButtonElement | null = $state(null);

	function close(e: MouseEvent) {
		if (e.button !== 2 && !triggerRef?.contains(e.target as Node))
			isActive = false;
	}

	$effect(() => {
		if (isActive)
			document.addEventListener('click', close);
		else
			document.removeEventListener('click', close);
	});

	onMount(() => () => document.removeEventListener('click', close));
</script>

<style>
	.dropdown-trigger .button:not(.borderless-button) {
		background: white;
		font-weight: 400;
		font-size: unset;
	}
	.dropdown-trigger .button, .dropdown-trigger .svelte-fa {
		color: var(--grey-darker);
	}

	.dropdown:not(.is-active) .dropdown-menu{
		display: none;
	}

	.dropdown-menu {
		position: relative;
		/* At 0, the menu is blocked by videos */
		z-index: 1;
	}

	.dropdown-content {
		position: absolute;
		display: flex;
		flex-direction: column;
		width: 250px;
		background-color: var(--scheme-main-ter);
	}

	:global(.dropdown-item) {
		display: block;
		font-size: 0.875rem;
		line-height: 1.5;
		padding: 0.375rem 1rem;
		position: relative;
	}

	:global(.dropdown-item:hover) {
		color: var(--white);
		background-color: var(--primary);
	}

	:global(button.dropdown-item) {
		color: var(--text);
		border: 0;
		background: none;
	}

	:global(a.dropdown-item), :global(a.dropdown-item:-webkit-any-link) {
		text-decoration: none;
		color: var(--text);
		text-align: center;
	}
</style>

<div
	class='dropdown'
	class:is-active={isActive}
	class:is-right={isRight}
>
	<div class={`dropdown-trigger ${triggerClasses}`}>
		<button bind:this={triggerRef} class={`button ${labelClasses}`} onclick={() => isActive = !isActive}>
			{#if triggerIcon}
				 {@render triggerIcon()}
			{:else}
				<span>{labelText}</span>
				<Fa icon={faAngleDown} class='is-small'/>
			{/if}
		</button>
	</div>
	<div class='dropdown-menu'>
		<div class='dropdown-content' onauxclick={close}>
			{@render children()}
		</div>
	</div>
</div>