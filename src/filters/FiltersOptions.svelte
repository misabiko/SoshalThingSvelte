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
	<div class="field has-addons">
		<div class="field-label is-normal">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">{
				instance.filter.service === null ?
					getFilterName(instance.filter.type, instance.inverted) :
					getServices()[instance.filter.service].filterTypes[instance.filter.type].name(instance.inverted)
			}</label>
		</div>
		<div class="field-body">
			<div class="control">
				<button class='button' class:is-success={instance.enabled} on:click={() => instance.enabled = !instance.enabled}>
					{instance.enabled ? 'Enabled' : 'Disabled'}
				</button>
			</div>
			<div class="control">
				<button class='button' class:is-info={instance.inverted} on:click={() => instance.inverted = !instance.inverted}>
					{instance.inverted ? 'Inverted' : 'Normal'}
				</button>
			</div>
			<div class="control">
				<button class='button' on:click={() => removeFilter(index)}>
					Remove
				</button>
			</div>
		</div>
	</div>

	{#if instance.filter.service !== null}
		{#each getServices()[instance.filter.service].filterTypes[instance.filter.type].props as prop}
			<div class="field has-addons">
				<div class="field-label is-small">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">{prop}</label>
				</div>
				<div class="field-body">
					<div class="control">
						<Input bind:value={instance.filter[prop]}/>
					</div>
				</div>
			</div>
		{/each}
	{/if}

	{#if instance.filter.type === 'repost' || instance.filter.type === 'quote'}
		<div class="field has-addons">
			<div class="field-label is-small">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Username</label>
			</div>
			<div class="field-body">
				<div class="control">
					<Input bind:value={instance.filter.byUsername}/>
				</div>
			</div>
		</div>
	{:else if instance.filter.type === 'interval'}
		<div class='field has-addons'>
			<div class='field-label is-small'>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class='label'>Interval</label>
			</div>
			<div class='field-body'>
				<div class='control'>
					<input type='number' class='input' bind:value={instance.filter.interval} min={1}/>
				</div>
			</div>
		</div>
		<div class='field has-addons'>
			<div class='field-label is-small'>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class='label'>Offset</label>
			</div>
			<div class='field-body'>
				<div class='control'>
					<input type='number' class='input' bind:value={instance.filter.offset} min={0}/>
				</div>
			</div>
		</div>
		<div class='field has-addons'>
			<div class='field-label is-small'>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class='label'>Include Offset</label>
			</div>
			<div class='field-body'>
				<div class='control'>
					<input type='checkbox' bind:checked={instance.filter.includeOffset}/>
				</div>
			</div>
		</div>
	{/if}
{/each}

<Dropdown labelText='New Filter'>
	{#each filterTypes as filterType}
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class='dropdown-item' on:click={() => addFilter(filterType, false)}>
			{ getFilterName(filterType, false) }
		</a>
	{/each}
	{#each serviceFilterTypes as filterType}
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class='dropdown-item' on:click={() => addFilter(filterType[1], false, filterType[0])}>
			{ filterType[2].name(false) }
		</a>
	{/each}
</Dropdown>
<Dropdown labelText='New Inverted Filter'>
	{#each filterTypes as filterType}
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="dropdown-item" on:click={() => addFilter(filterType, true)}>
			{ getFilterName(filterType, true) }
		</a>
	{/each}
	{#each serviceFilterTypes as filterType}
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class="dropdown-item" on:click={() => addFilter(filterType[1], true, filterType[0])}>
			{ filterType[2].name(true) }
		</a>
	{/each}
</Dropdown>