<script lang='ts'>
	import {endpoints} from '~/services/endpoints';
	import EndpointOptions from './EndpointOptions.svelte';

	console.log('endpoints:', endpoints);
</script>

<section>
	{#each Object.entries(endpoints) as [name, endpoint] (name)}
		<EndpointOptions {endpoint}/>
	{:else}
		No endpoints currently
	{/each}
</section>