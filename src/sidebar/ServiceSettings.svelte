<script lang='ts'>
	import {FetchType, type Service} from '../services/service';
	import {fetchExtension} from '../services/extension';

	export let service: Service;
	let tabId = service.fetchInfo.tabInfo?.tabId;

	async function getTabId() {
		if (service.fetchInfo.type !== FetchType.Tab)
			throw new Error(service.name + ' does not have tab info');

		service.fetchInfo.tabInfo.tabId.set(await fetchExtension('getTabId', {
			url: service.fetchInfo.tabInfo.url,
			matchUrl: service.fetchInfo.tabInfo.matchUrl,
		}));
	}
</script>

<style>
	h1 {
		margin-top: 0;
	}
</style>

<h1>{service.name}</h1>

{#if service.fetchInfo.tabInfo}
	Tab Id: {$tabId}
	<br/>
	<button on:click={getTabId}>
		Get tab id
	</button>
	<br/>
{/if}
<svelte:component this={service.settings}/>