<script lang='ts'>
	import {methodName, type SortInfo, SortMethod} from './index'
	import Dropdown from "../Dropdown.svelte"
	import {directionLabel, genericSortMethods} from "./index.js"
	import {getServices} from '../services/service'

	export let sortInfo: SortInfo
	export let sortOnce: (method: SortMethod, reversed: boolean) => void

	const serviceSortMethods = Object.values(getServices()).flatMap(s => Object.entries(s.sortMethods).map(m => [s.name, ...m]))
	console.log(serviceSortMethods);

	let currentMethodName: string
	$: {
		switch (sortInfo.method) {
			case undefined:
				currentMethodName = 'Unsorted';
				break;
			case SortMethod.Custom:
				currentMethodName = `${sortInfo.customMethod.service} - ${getServices()[sortInfo.customMethod.service].sortMethods[sortInfo.customMethod.method].name}`
				break;
			default:
				currentMethodName = methodName(sortInfo.method);
		}
	}
</script>

<div class='block field has-addons'>
	<div class='field-label is-normal'>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class='label'>
			Sort Method
		</label>
	</div>
	<div class='field-body'>
		<div class='control'>
			<Dropdown labelText={currentMethodName}>
				{#each genericSortMethods as method}
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class='dropdown-item' on:click={() => {sortInfo.method = method; sortInfo.customMethod = undefined}}>
						{ `${methodName(method)} - ${directionLabel(method, sortInfo.reversed || false)}` }
					</a>
				{/each}
				{#each serviceSortMethods as method}
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class='dropdown-item' on:click={() => {
						sortInfo.method = SortMethod.Custom;
						sortInfo.customMethod = {
							method: method[1],
							service: method[0]
						}}}>
						{ `${method[2].name} - ${method[2].directionLabel(sortInfo.reversed || false)}` }
					</a>
				{/each}
				<!-- svelte-ignore a11y-missing-attribute -->
				<a class='dropdown-item' on:click={() => sortInfo.method = undefined}>
					Unsorted
				</a>
			</Dropdown>
		</div>
		<div class='control'>
			<button class='button' on:click={() => sortInfo.reversed = !sortInfo.reversed}>
				{#if sortInfo.method !== undefined}
					{directionLabel(sortInfo.method, sortInfo.reversed)}
				{:else}
					{sortInfo.reversed ? 'Reversed' : 'Normal'}
				{/if}
			</button>
		</div>
		{#if sortInfo.method === undefined}
			<div class='control'>
				<Dropdown labelText='Sort once'>
					{#each genericSortMethods as method}
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => sortOnce(method, false)}>
							{ `${methodName(method)} - ${directionLabel(method, false)}` }
						</a>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a class='dropdown-item' on:click={() => sortOnce(method, true)}>
							{ `${methodName(method)} - ${directionLabel(method, true)}` }
						</a>
					{/each}
				</Dropdown>
			</div>
		{/if}
	</div>
</div>