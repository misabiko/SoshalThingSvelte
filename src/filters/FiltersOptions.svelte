<script lang='ts'>
	import {type Filter, type FilterInfo, type FilterInstance, getFilterName} from './index';
	import Dropdown from '../Dropdown.svelte';
	import {genericFilterTypes} from './index';
	import {defaultFilter} from './index';
	import {getServices} from '~/services/service';
	import {updateTimelinesStorageValue} from '~/storages';

	export let timelineId: string | null;
	export let instances: FilterInstance[];
	$: {
		if (timelineId !== null)
			updateTimelinesStorageValue(timelineId, 'filters', instances);
	}

	const serviceFilterTypes: {
		service: string,
		filter: string,
		filterTypeInfo: FilterInfo,
	}[] = Object.values(getServices()).flatMap(s => Object.entries(s.filterTypes).map(m => ({
		service: s.name,
		filter: m[0],
		filterTypeInfo: m[1],
	})));

	function addFilter(filterType: Filter['type'], inverted: boolean, service: string | null = null) {
		instances.push({
			filter: defaultFilter(filterType, service),
			enabled: true,
			inverted
		});
		instances = instances;
	}

	function removeFilter(index: number) {
		instances.splice(index, 1);
		instances = instances;
	}
</script>

{#each instances as instance, index (`${JSON.stringify(instance)}/${index}`)}
	{@const filterTypeInfo = instance.filter.service === null
		? genericFilterTypes[instance.filter.type]
		: getServices()[instance.filter.service].filterTypes[instance.filter.type]
	}
	<div class="field">
		<label>
			{
				getFilterName(
					instance.filter.service === null
						? genericFilterTypes[instance.filter.type]
						: getServices()[instance.filter.service].filterTypes[instance.filter.type],
					instance.inverted
				)
			}
			<button class='button' class:is-success={instance.enabled} on:click={() => instance.enabled = !instance.enabled}>
				{instance.enabled ? 'Enabled' : 'Disabled'}
			</button>
			<button class='button' class:is-info={instance.inverted} on:click={() => instance.inverted = !instance.inverted}>
				{instance.inverted ? 'Inverted' : 'Normal'}
			</button>
			<button class='button' on:click={() => removeFilter(index)}>
				Remove
			</button>
		</label>
	</div>

	{#each Object.entries(filterTypeInfo.props) as [propName, propType]}
		<div class="field">
			<label>
				{propName}
				{#if propType.type === 'boolean'}
					<input type='checkbox' bind:checked={instance.filter.props[propName]}/>
				{:else if propType.type === 'number'}
					<input
						type='number'
						bind:value={instance.filter.props[propName]}
						min={propType.min}
						max={propType.max}
					/>
				{:else}
					<input bind:value={instance.filter.props[propName]}/>
				{/if}
			<!--	TODO Add string array type-->
			</label>
		</div>
	{/each}
{/each}

<Dropdown labelText='New Filter'>
	{#each Object.entries(genericFilterTypes) as [filterType, filterTypeInfo]}
		<button class='dropdown-item' on:click={() => addFilter(filterType, false)}>
			{ filterTypeInfo.name }
		</button>
	{/each}
	{#each serviceFilterTypes as filterType}
		<button class='dropdown-item' on:click={() => addFilter(filterType.filter, false, filterType.service)}>
			{ filterType.filterTypeInfo.name }
		</button>
	{/each}
</Dropdown>
<Dropdown labelText='New Inverted Filter'>
	{#each Object.entries(genericFilterTypes) as [filterType, filterTypeInfo]}
		<button class="dropdown-item" on:click={() => addFilter(filterType, true)}>
			{ filterTypeInfo.invertedName }
		</button>
	{/each}
	{#each serviceFilterTypes as filterType}
		<button class="dropdown-item" on:click={() => addFilter(filterType.filter, true, filterType.service)}>
			{ filterType.filterTypeInfo.invertedName }
		</button>
	{/each}
</Dropdown>