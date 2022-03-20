<script lang="ts">
	//From https://github.com/sveltejs/svelte/issues/3088#issuecomment-1065827485
	import { onMount, onDestroy } from 'svelte';

	export let target: HTMLElement | null | undefined = globalThis.document?.body;
	export let tag: string = 'div';

	let ref: HTMLElement;

	onMount(() => {
		if (target) {
			target.appendChild(ref);
		}
	})

	// this block is almost needless/useless (if not totally) as, on destroy, the ref will no longer exist/be in the DOM anyways
	onDestroy(() => {
		setTimeout(() => {
			if (ref?.parentNode) {
				ref.parentNode?.removeChild(ref);
			}
		})
	})
</script>

{#if tag === 'li'}
	<li bind:this={ref}>
		<slot />
	</li>
{:else}
	<div bind:this={ref}>
		<slot />
	</div>
{/if}