<script lang='ts'>
	//https://github.com/c0bra/svelma/blob/master/src/components/Modal/Modal.svelte
	//https://svelte.dev/examples/modal
	export let active: boolean;
	export let mountElement: Element | null = null;

	let modal: HTMLDivElement;

	$: {
		if (modal && active && mountElement) {
			mountElement.appendChild(modal)
		}
	}

	function close() {
		active = false;
	}
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
		align-content: center;
		justify-content: center;
		z-index: 1000;
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
		margin: 5em;
		z-index: 1001;
		overflow-y: auto;
	}
</style>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<div class="modal" class:active={active} bind:this={modal}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="modal-background" on:click={close}/>
	<div class="modal-content">
		<slot/>
	</div>
</div>