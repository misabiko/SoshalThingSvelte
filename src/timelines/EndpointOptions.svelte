<script lang='ts'>
	import {get} from 'svelte/store';
	import {getServices} from '../services/service';
	import type {TimelineData} from './index';
	import {endpoints, everyRefreshType} from '../services/endpoints';
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

		if (timelineId !== null)
			updateTimelinesStorageEndpoints(timelineId, data.endpoints);
	}
</script>

<ul>
	{#each data.endpoints.map(te => te.endpoint || get(endpoints[te.name])) as endpoint (endpoint)}
		<li>
			{endpoint.name}
			{#if endpoint.menuComponent}
				<svelte:component this={endpoint.menuComponent} {endpoint} timeline={data}/>
			{/if}
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
				<input type='number' bind:value={params[key]}/>
			{:else if typeof value === 'boolean'}
				<input type='checkbox' bind:checked={params[key]}/>
			{:else}
				<input type='text' bind:value={params[key]}/>
			{/if}
		</label>
	{/each}
	<br/>
	<button on:click={addEndpoint}>New Endpoint</button>
{/if}