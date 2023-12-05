<script lang='ts'>
	import {methodName, type SortInfo, SortMethod} from './index'
	import Dropdown from "../Dropdown.svelte"
	import {directionLabel, genericSortMethods} from "./index.js"
	import {getServices} from '../services/service'

	let {
		sortInfo,
		sortOnce
	} = $props<{
		sortInfo: SortInfo,
		sortOnce: (method: SortMethod, reversed: boolean) => void
	}>();

	//[ServiceName, MethodName, MethodInfo][]
	const serviceSortMethods: [string, string, object][] = Object.values(getServices()).flatMap(s => Object.entries(s.sortMethods).map(m => [s.name, ...m]))

	let currentMethodName = $state<string>();
	$effect(() => {
		switch (sortInfo.method) {
			case null:
			case undefined:
				currentMethodName = 'Unsorted';
				break;
			case SortMethod.Custom:
				currentMethodName = `${sortInfo.customMethod.service} - ${getServices()[sortInfo.customMethod.service].sortMethods[sortInfo.customMethod.method].name}`
				break;
			default:
				currentMethodName = methodName(sortInfo.method);
		}
	});
</script>

<div class='block field has-addons'>
	<label class='label'>
		Sort Method
		<Dropdown labelText={currentMethodName}>
			{#each genericSortMethods as method}
				{#each [false, true] as reversed}
					<button
						class='dropdown-item'
						on:click={() => {sortInfo.method = method; sortInfo.customMethod = null; sortInfo.reversed = reversed}}
					>
						{ `${methodName(method)} - ${directionLabel(method, reversed)}` }
					</button>
				{/each}
			{/each}
			{#each serviceSortMethods as method}
				{#each [false, true] as reversed}
					<button
						class='dropdown-item'
						on:click={() => {
							sortInfo.method = SortMethod.Custom;
							sortInfo.customMethod = {
								method: method[1],
								service: method[0]
							};
							sortInfo.reversed = reversed;
						}}
					>
						{ `${method[2].name} - ${method[2].directionLabel(reversed)}` }
					</button>
				{/each}
			{/each}
			<button class='dropdown-item' on:click={() => sortInfo.method = undefined}>
				Unsorted
			</button>
		</Dropdown>
		<button class='button' on:click={() => sortInfo.reversed = !sortInfo.reversed}>
			{#if sortInfo.method !== undefined}
				{directionLabel(sortInfo.method, sortInfo.reversed)}
			{:else}
				{sortInfo.reversed ? 'Reversed' : 'Normal'}
			{/if}
		</button>
		{#if sortInfo.method === undefined}
			<Dropdown labelText='Sort once'>
				{#each genericSortMethods as method}
					<button class='dropdown-item' on:click={() => sortOnce(method, false)}>
						{ `${methodName(method)} - ${directionLabel(method, false)}` }
					</button>
					<button class='dropdown-item' on:click={() => sortOnce(method, true)}>
						{ `${methodName(method)} - ${directionLabel(method, true)}` }
					</button>
				{/each}
			</Dropdown>
		{/if}
	</label>
</div>