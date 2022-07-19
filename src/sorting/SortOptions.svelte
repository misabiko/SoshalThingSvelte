<script lang='ts'>
	import {methodName, type SortInfo, SortMethod} from './index'
	import Dropdown from "../Dropdown.svelte";
	import {allSortMethods, directionLabel} from "./index.js"

	export let sortInfo: SortInfo
	export let sortOnce: (method: SortMethod, reversed: boolean) => void

	let currentMethodName: string
	$: currentMethodName = sortInfo.method !== undefined ? methodName(sortInfo.method) : 'Unsorted'
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
				{#each allSortMethods as method}
					<!-- svelte-ignore a11y-missing-attribute -->
					<a class='dropdown-item' on:click={() => sortInfo.method = method}>
						{ `${methodName(method)} - ${directionLabel(method, sortInfo.reversed || false)}` }
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
					{#each allSortMethods as method}
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