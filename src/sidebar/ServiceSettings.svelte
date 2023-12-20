<script lang='ts'>
	import type {Service} from '../services/service';
	import {fetchExtension} from '../services/extension';

	export let service: Service;
	let tabId = service.tabInfo?.tabId;

	async function getTabId() {
		if (!service.tabInfo)
			throw new Error(service.name + ' does not have tab info');

		service.tabInfo.tabId.set(await fetchExtension('getTabId', {
			url: service.tabInfo.url,
			matchUrl: service.tabInfo.matchUrl,
		}));
	}
</script>

<style>
	h1 {
		margin-top: 0;
	}
</style>

<h1>{service.name}</h1>

{#if service.tabInfo}
	Tab Id: {$tabId}
	<br/>
	<button on:click={getTabId}>
		Get tab id
	</button>
	<br/>
{/if}
<svelte:component this={service.settings}/>