<script lang='ts'>
	import {FetchType, type Service as ServiceType} from '~/services/service';
	import {fetchExtension} from '~/services/extension';

	let {
		service: Service,
	}: {
		service: ServiceType
	} = $props();
	let tabId = Service.fetchInfo.tabInfo?.tabId;

	async function getTabId() {
		if (Service.fetchInfo.type !== FetchType.Tab)
			throw new Error(Service.name + ' does not have tab info');

		Service.fetchInfo.tabInfo.tabId.set(await fetchExtension('getTabId', {
			url: Service.fetchInfo.tabInfo.url,
			matchUrl: Service.fetchInfo.tabInfo.matchUrl,
		}));
	}

	//TODO Add option to reset template storage
</script>

<style>
	h1 {
		margin-top: 0;
	}
</style>

<h1>{Service.name}</h1>

{#if Service.fetchInfo.tabInfo}
	Tab Id: {$tabId}
	<br/>
	<button onclick={getTabId}>
		Get tab id
	</button>
	<br/>
{/if}
<Service.settings />