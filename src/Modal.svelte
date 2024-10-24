<script lang='ts'>
	//https://github.com/c0bra/svelma/blob/master/src/components/Modal/Modal.svelte
	//https://svelte.dev/examples/modal
	import {onDestroy, type Snippet} from 'svelte';

	let {
		active = $bindable(),
		mountElement,
		children,
	}: {
		active: boolean;
		mountElement: Element | null;
		children: Snippet;
	} = $props();

	let modal: HTMLDivElement;

	$effect(() => {
		if (modal && active && mountElement) {
			mountElement.appendChild(modal);
		}
	});

	function close() {
		modal.remove();
		active = false;
	}

	onDestroy(() => {
		close();
	});
</script>

<style>
	.modal {
		top: 0;
		left: 0;
		overflow-x: auto;
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 5em;
		box-sizing: border-box;
	}

	.modal:not(.active) {
		display: none;
	}

	.modal-background {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
	}

	.modal-content {
		z-index: 1001;
		overflow-y: auto;
		pointer-events: none;
		height: 100%

	}

	:global(.modal-content > *) {
		pointer-events: visible;
	}
</style>

<div class='modal' class:active={active} bind:this={modal}>
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
	<div class='modal-background' onclick={close}></div>
	<div class='modal-content'>
		{@render children()}
	</div>
</div>