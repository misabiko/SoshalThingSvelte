<script lang='ts'>
	import type {Filter, FilterInstance} from './index'
	import Dropdown from "../Dropdown.svelte";
	import {filterTypes, getFilterName} from "./index.js"
	import {defaultFilter} from './index'
	import {getServices} from '../services/service'

	export let instances: FilterInstance[]

	//[ServiceName, FilterName, FilterTypeInfo][]
	const serviceFilterTypes: [string, string, object][] = Object.values(getServices()).flatMap(s => Object.entries(s.filterTypes).map(m => [s.name, ...m]))

	function addFilter(filterType: Filter['type'], inverted: boolean, service: string = null) {
		instances.push({
			filter: defaultFilter(filterType, service),
			enabled: true,
			inverted
		})
		instances = instances
	}

	function removeFilter(index: number) {
		instances.splice(index, 1)
		instances = instances
	}
</script>

{#each instances as instance, index (`${JSON.stringify(instance)}/${index}`)}
	<!-- TODO Add has-addons' merged buttons -->
	<div class="field has-addons">
		<label>
			{
				instance.filter.service === null ?
					getFilterName(instance.filter.type, instance.inverted) :
					getServices()[instance.filter.service].filterTypes[instance.filter.type].name(instance.inverted)
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

	{#if instance.filter.service !== null}
		{#each getServices()[instance.filter.service].filterTypes[instance.filter.type].props as prop}
			<div class="field has-addons">
				<label>
					{prop}
					<input bind:value={instance.filter[prop]}/>
				</label>
			</div>
		{/each}
	{/if}

	{#if instance.filter.type === 'repost' || instance.filter.type === 'quote'}
		<div class="field has-addons">
			<label>
				Username
				<input bind:value={instance.filter.byUsername}/>
			</label>
		</div>
	{:else if instance.filter.type === 'interval'}
		<div class='field has-addons'>
			<label>
				Interval
				<input type='number' class='input' bind:value={instance.filter.interval} min={1}/>
			</label>
		</div>
		<div class='field has-addons'>
			<label>
				Offset
				<input type='number' class='input' bind:value={instance.filter.offset} min={0}/>
			</label>
		</div>
		<div class='field has-addons'>
			<label>
				<input type='checkbox' bind:checked={instance.filter.includeOffset}/>
				Include Offset
			</label>
		</div>
	{/if}
{/each}

<Dropdown labelText='New Filter'>
	{#each filterTypes as filterType}
		<button class='dropdown-item' on:click={() => addFilter(filterType, false)}>
			{ getFilterName(filterType, false) }
		</button>
	{/each}
	{#each serviceFilterTypes as filterType}
		<button class='dropdown-item' on:click={() => addFilter(filterType[1], false, filterType[0])}>
			{ filterType[2].name(false) }
		</button>
	{/each}
</Dropdown>
<Dropdown labelText='New Inverted Filter'>
	{#each filterTypes as filterType}
		<button class="dropdown-item" on:click={() => addFilter(filterType, true)}>
			{ getFilterName(filterType, true) }
		</button>
	{/each}
	{#each serviceFilterTypes as filterType}
		<button class="dropdown-item" on:click={() => addFilter(filterType[1], true, filterType[0])}>
			{ filterType[2].name(true) }
		</button>
	{/each}
</Dropdown>