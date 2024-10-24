<script lang='ts'>
	//https://github.com/c0bra/svelma/blob/master/src/components/Modal/Modal.svelte
	//https://svelte.dev/examples/modal
	export let active: boolean;
	export let mountElement: Element | null = null;

	let modal: HTMLDivElement;

	$: {
		if (modal && active && mountElement) {
			mountElement.appendChild(modal);
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
	<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
	<div class='modal-background' onclick={close}></div>
	<div class='modal-content'>
		<slot/>
	</div>
</div>