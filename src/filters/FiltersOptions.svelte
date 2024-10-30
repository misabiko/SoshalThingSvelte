<script lang='ts'>
	import {type Filter, type FilterInfo, type FilterInstance, getFilterName} from './index';
	import Dropdown from '../Dropdown.svelte';
	import {genericFilterTypes} from './index';
	import {defaultFilter} from './index';
	import {getService, getServices} from '~/services/service';
	import type {Writable} from 'svelte/store';

	export let onInstancesUpdate: (i: FilterInstance[]) => void;
	export let instances: Writable<FilterInstance[]>;
	$: onInstancesUpdate($instances);

	const serviceFilterTypes: {
		service: string
		filter: string
		filterTypeInfo: FilterInfo
	}[] = Object.values(getServices()).flatMap(s => Object.entries(s.filterTypes).map(m => ({
		service: s.name,
		filter: m[0],
		filterTypeInfo: m[1],
	})));

	function addFilter(filterType: Filter['type'], inverted: boolean, service: string | null = null) {
		instances.update(i => {
			i.push({
				filter: defaultFilter(filterType, service),
				enabled: true,
				inverted,
			});
			return i;
		});
	}

	function removeFilter(index: number) {
		instances.update(i => {
			i.splice(index, 1);
			return i;
		});
	}
</script>

{#each $instances as instance, index (`${JSON.stringify(instance)}/${index}`)}
	{@const filterTypeInfo: FilterInfo = instance.filter.service === null
		? genericFilterTypes[instance.filter.type]
		: getService(instance.filter.service).filterTypes[instance.filter.type]!
	}
	<div class='field'>
		<label>
			{#if instance.filter.service !== null}
				{`${instance.filter.service}: ` }
			{/if}
			{getFilterName(filterTypeInfo, instance.inverted)}
			<button class='button' class:is-success={instance.enabled} onclick={() => $instances[index]!.enabled = !instance.enabled}>
				{instance.enabled ? 'Enabled' : 'Disabled'}
			</button>
			<button class='button' class:is-info={instance.inverted} onclick={() => $instances[index]!.inverted = !instance.inverted}>
				{instance.inverted ? 'Inverted' : 'Normal'}
			</button>
			<button class='button' onclick={() => removeFilter(index)}>
				Remove
			</button>
		</label>
	</div>

	{#each Object.entries(filterTypeInfo.props) as [propName, propType]}
		<div class='field'>
			<label>
				{propName}
				{#if propType.type === 'boolean'}
					<input
						type='checkbox'
						bind:checked={instance.filter.props[propName]}
						indeterminate={propType.optional && instance.filter.props[propName] === undefined}
						required={!propType.optional}
					/>
				{:else if propType.type === 'number'}
					<input
						type='number'
						value={instance.filter.props[propName] ?? ''}
						onchange={e => {
							if (propType.optional && e.currentTarget.value === '')
								delete $instances[index]!.filter.props[propName];
							else
								$instances[index]!.filter.props[propName] = Number(e.currentTarget.value);
						}}
						min={propType.min}
						max={propType.max}
						required={!propType.optional}
					/>
				{:else if propType.type === 'order'}
					<select
						onchange={e => $instances[index]!.filter.props[propName].comparator = e.currentTarget.value}
						required={true}
					>
						{#each ['=', '!=', '>', '>=', '<', '<='] as comparator}
							<option value={comparator} selected={comparator === (instance.filter.props[propName]?.comparator ?? '=')}>{comparator}</option>
						{/each}
					</select>
					<input
						type='number'
						value={instance.filter.props[propName].value ?? ''}
						onchange={e => {
							if (propType.optional && e.currentTarget.value === '')
								delete $instances[index]!.filter.props[propName].value;
							else
								$instances[index]!.filter.props[propName].value = Number(e.currentTarget.value);
						}}
						min={propType.min}
						max={propType.max}
						required={true}
					/>
				{:else if propType.type === 'select'}
					<select
						onchange={e => $instances[index]!.filter.props[propName] = [...e.currentTarget.selectedOptions].map(o => o.value)}
						multiple={propType.multiple}
						required={!propType.optional}
					>
						{#each Object.entries(propType.options) as [option, optionName]}
							<option
								value={option}
								selected={instance.filter.props[propName]?.includes(option)}
							>{optionName}</option>
						{/each}
					</select>
				{:else}
					<!--TODO Enforce required-->
					<input
						value={instance.filter.props[propName] ?? ''}
						onchange={e => {
							if (propType.optional && e.currentTarget.value === '')
								delete $instances[index]!.filter.props[propName];
							else
								$instances[index]!.filter.props[propName] = e.currentTarget.value;
						}}
						required={!propType.optional}
					/>
				{/if}
			<!--	TODO Add string array type-->
			</label>
		</div>
	{/each}
{/each}

<Dropdown labelText='New Filter'>
	{#each Object.entries(genericFilterTypes) as [filterType, filterTypeInfo]}
		<button class='dropdown-item' onclick={() => addFilter(filterType, false)}>
			{ filterTypeInfo.name }
		</button>
	{/each}
	{#each serviceFilterTypes as filterType}
		<button class='dropdown-item' onclick={() => addFilter(filterType.filter, false, filterType.service)}>
			{ filterType.service }: { filterType.filterTypeInfo.name }
		</button>
	{/each}
</Dropdown>
<Dropdown labelText='New Inverted Filter'>
	{#each Object.entries(genericFilterTypes) as [filterType, filterTypeInfo]}
		<button class='dropdown-item' onclick={() => addFilter(filterType, true)}>
			{ filterTypeInfo.invertedName }
		</button>
	{/each}
	{#each serviceFilterTypes as filterType}
		<button class='dropdown-item' onclick={() => addFilter(filterType.filter, true, filterType.service)}>
			{ filterType.service }: { filterType.filterTypeInfo.invertedName }
		</button>
	{/each}
</Dropdown>