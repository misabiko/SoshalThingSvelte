<script>
	export let article;
	export let view;
	export let style;

	function onMediaClick() {
		console.log('')
	}
</script>

<svelte:component this={view} {article} {style}/>