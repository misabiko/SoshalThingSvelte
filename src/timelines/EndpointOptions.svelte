<script lang='ts'>
	import {get} from 'svelte/store';
	import {getServices} from '../services/service';
	import type {TimelineData} from './index';
	import {endpoints, everyRefreshType, RefreshType} from '../services/endpoints';
	import {updateTimelinesStorageEndpoints} from '../storages';

	export let timelineId: string | null;
	export let data: TimelineData;

	let newEndpointServices = Object.values(getServices()).filter(s => Object.values(s.endpointConstructors).length > 0);
	let newEndpointService: string = newEndpointServices[0]?.name;
	let newEndpoint: string = Object.values(newEndpointServices[0]?.endpointConstructors)[0]?.name;
	$: {
		if (!Object.hasOwn(getServices()[newEndpointService]?.endpointConstructors, newEndpoint))
			newEndpoint = Object.values(getServices()[newEndpointService]?.endpointConstructors)[0]?.name;
	}
	let params = Object.fromEntries(getServices()[newEndpointService]?.endpointConstructors[newEndpoint]?.paramTemplate);
	function updateParams() {
		params = Object.fromEntries(getServices()[newEndpointService]?.endpointConstructors[newEndpoint]?.paramTemplate);
	}

	function addEndpoint() {
		data.endpoints.push({
			endpoint: getServices()[newEndpointService].endpointConstructors[newEndpoint].constructor(params),
			refreshTypes: everyRefreshType,
			filters: [],
		});

		data.endpoints = data.endpoints;

		if (timelineId !== null)
			updateTimelinesStorageEndpoints(timelineId, data.endpoints);
	}

	function removeEndpoint(index: number) {
		data.endpoints.splice(index, 1);

		data.endpoints = data.endpoints;

		if (timelineId !== null)
			updateTimelinesStorageEndpoints(timelineId, data.endpoints);
	}

	function onRefreshTypeChange(index: number, refreshType: RefreshType, checked: boolean) {
		if (checked)
			data.endpoints[index].refreshTypes.add(refreshType);
		else
			data.endpoints[index].refreshTypes.delete(refreshType);

		data.endpoints = data.endpoints;

		if (timelineId !== null)
			updateTimelinesStorageEndpoints(timelineId, data.endpoints);
	}

	const refreshTypeNames = {
		[RefreshType.RefreshStart]: 'Refresh Start',
		[RefreshType.Refresh]: 'Refresh',
		[RefreshType.LoadTop]: 'Load Top',
		[RefreshType.LoadBottom]: 'Load Bottom',
	}

	//TODO Add auto refresh option
</script>

<style>
	ul {
		list-style-type: none;
		padding-left: 0;
	}
</style>

<ul>
	{#each data.endpoints as timelineEndpoint, i}
		{@const endpoint = (timelineEndpoint.endpoint || get(endpoints[timelineEndpoint.name]))}
		{@const endpointRefreshTypes = get(endpoint.refreshTypes)}
		<li>
			<h2>{endpoint.name}</h2>
			{#if endpoint.menuComponent}
				<svelte:component this={endpoint.menuComponent} {endpoint} timeline={data}/>
			{/if}
			{#each [...everyRefreshType].filter(rt => endpointRefreshTypes.has(rt)) as refreshType (refreshType)}
				<label>
					{refreshTypeNames[refreshType]}
					<input
							type='checkbox'
							checked={timelineEndpoint.refreshTypes.has(refreshType)}
							on:change={e => onRefreshTypeChange(i, refreshType, e.currentTarget.checked)}
					/>
				</label>
			{/each}

			<button on:click={() => removeEndpoint(i)}>Remove</button>
		</li>
	{/each}
</ul>

{#if newEndpointServices.length > 0}
	<select bind:value={newEndpointService} on:change={updateParams}>
		{#each newEndpointServices as service}
			<option value={service.name}>{service.name}</option>
		{/each}
	</select>
	<select bind:value={newEndpoint} on:change={updateParams}>
		{#each Object.values(getServices()[newEndpointService].endpointConstructors) as endpoint}
			<option value={endpoint.name}>{endpoint.name}</option>
		{/each}
	</select>
	<br/>

	{#each Object.entries(params) as [key, value]}
		<label class='field'>
			{key}
			{#if typeof value === 'number'}
				<input type='number' bind:value/>
			{:else if typeof value === 'boolean'}
				<input type='checkbox' bind:checked={value}/>
			{:else}
				<input type='text' bind:value/>
			{/if}
		</label>
	{/each}
	<br/>

	<button on:click={addEndpoint}>New Endpoint</button>
{/if}