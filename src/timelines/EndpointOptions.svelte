<script lang='ts'>
	import {get} from 'svelte/store';
	import {addArticles, getServices} from '~/services/service';
	import {type TimelineData, type TimelineEndpoint} from './index';
	import {
		addEndpointArticlesToTimeline, Endpoint,
		endpoints,
		everyRefreshType,
		LoadableEndpoint,
		LoadablePageEndpoint,
		RefreshType
	} from '~/services/endpoints';
	import {updateTimelinesStorageEndpoints} from '~/storages';
	import {getRootArticle} from '~/articles';

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
	};

	//TODO Add auto refresh option

	async function loadRandomPage(timelineEndpoint: TimelineEndpoint) {
			let endpoint: Endpoint;

		if (timelineEndpoint.name !== undefined)
			endpoint = get(endpoints[timelineEndpoint.name]);
		else
			endpoint = timelineEndpoint.endpoint;

		if (!(endpoint instanceof LoadableEndpoint || endpoint instanceof LoadablePageEndpoint))
			throw new Error('Endpoint is not loadable');
		if (endpoint.lastPage === null)
			throw new Error('Endpoint does not have a last page');

		//TODO Have a loadPage(pageNum) function, also keep track of loaded pages
		endpoint.currentPage = Math.floor(Math.random() * endpoint.lastPage);
		console.log('Loading page', endpoint.currentPage);

		let articles;
		try {
			articles = await endpoint.refresh(RefreshType.Refresh);
		}catch (e) {
			console.error(`Error refreshing ${endpoint.name}`, e);
			return [];
		}

		if (!articles.length)
			return [];

		//Filtering articles the endpoint already has
		//TODO Update current articles
		endpoint.articleIdPairs.push(...articles
			.map(a => getRootArticle(a).idPair)
			.filter(idPair => !endpoint.articleIdPairs
				.some(pair =>
					pair.service === idPair.service &&
					pair.id === idPair.id,
				)
			)
		);

		addArticles(false, ...articles);

		await addEndpointArticlesToTimeline(endpoint.name, articles, RefreshType.Refresh);
	}
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
							onchange='{e => onRefreshTypeChange(i, refreshType, e.currentTarget.checked)}'
					/>
				</label>
			{/each}

			{#if (endpoint instanceof LoadablePageEndpoint || endpoint instanceof LoadableEndpoint) && endpoint.lastPage}
				<button onclick='{() => loadRandomPage(timelineEndpoint)}'>Load Random</button>
			{/if}

			<button onclick='{() => removeEndpoint(i)}'>Remove</button>
		</li>
	{/each}
</ul>

{#if newEndpointServices.length > 0}
	<select bind:value={newEndpointService} onchange={updateParams}>
		{#each newEndpointServices as service}
			<option value={service.name}>{service.name}</option>
		{/each}
	</select>
	<select bind:value={newEndpoint} onchange={updateParams}>
		{#each Object.values(getServices()[newEndpointService].endpointConstructors) as endpoint}
			<option value={endpoint.name}>{endpoint.name}</option>
		{/each}
	</select>
	<br/>

	{#each Object.entries(params) as [key, value]}
		<label class='field'>
			{key}
			{#if typeof value === 'number'}
				<input type='number' {value} onchange='{e => params[key] = parseInt(e.currentTarget.value)}'/>
			{:else if typeof value === 'boolean'}
				<input type='checkbox' checked={value} onchange='{e => params[key] = e.currentTarget.checked}'/>
			{:else}
				<input type='text' {value} onchange='{e => params[key] = e.currentTarget.value}'/>
			{/if}
		</label>
	{/each}
	<br/>

	<button onclick={addEndpoint}>New Endpoint</button>
{/if}