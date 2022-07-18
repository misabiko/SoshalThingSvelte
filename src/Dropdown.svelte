<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte'
	import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

	export let isActive = false
	export let isRight = false
	export let triggerClasses = ''
	export let labelClasses = ''
	export let labelText = ''
</script>
<div
	class='dropdown'
	class:is-active={isActive}
	class:is-right={isRight}
>
	<div class={`dropdown-trigger ${triggerClasses}`}>
		<button class={`button ${labelClasses}`} on:click={() => isActive = !isActive}>
			{#if $$slots.triggerIcon}
				<slot name='triggerIcon'></slot>
			{:else}
				<span>{labelText}</span>
				<Fa icon={faAngleDown} class='is-small'/>
			{/if}
		</button>
	</div>
	<div class='dropdown-menu'>
		<div class='dropdown-content'>
			<slot></slot>
		</div>
	</div>
</div>