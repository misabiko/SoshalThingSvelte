<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte'
	import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
	import {onMount} from 'svelte'

	export let isActive = false
	export let isRight = false
	export let triggerClasses = ''
	export let labelClasses = ''
	export let labelText = ''

	let triggerRef: HTMLButtonElement | null = null

	function close(e: MouseEvent) {
		if (e.button !== 2 && !triggerRef?.contains(e.target as Node))
			isActive = false
	}

	$: if (isActive)
		document.addEventListener('click', close)
	else
		document.removeEventListener('click', close)

	onMount(() => () => document.removeEventListener('click', close))
</script>

<div
	class='dropdown'
	class:is-active={isActive}
	class:is-right={isRight}
>
	<div class={`dropdown-trigger ${triggerClasses}`}>
		<button bind:this={triggerRef} class={`button ${labelClasses}`} on:click={() => isActive = !isActive}>
			{#if $$slots.triggerIcon}
				<slot name='triggerIcon'></slot>
			{:else}
				<span>{labelText}</span>
				<Fa icon={faAngleDown} class='is-small'/>
			{/if}
		</button>
	</div>
	<div class='dropdown-menu'>
		<div class='dropdown-content' on:auxclick={close}>
			<slot></slot>
		</div>
	</div>
</div>