<script lang='ts'>
	import type {Filter, FilterInstance} from './index'
	import Dropdown from "../Dropdown.svelte";
	import {filterTypes, getFilterName} from "./index.js"
	import {defaultFilter} from './index'

	export let instances: FilterInstance[]

	function addFilter(filterType: Filter['type'], inverted: boolean) {
		instances.push({
			filter: defaultFilter(filterType),
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
			<label class="label">{ getFilterName(instance.filter.type, instance.inverted) }</label>
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

	<!--{instance.filter.parameter_view(param_callback)}-->
{/each}

<!--TODO has-addons-->
<Dropdown labelText='New Filter'>
	{#each filterTypes as filterType}
		<!-- svelte-ignore a11y-missing-attribute -->
		<a class='dropdown-item' on:click={() => addFilter(filterType, false)}>
			{ getFilterName(filterType, false) }
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
</Dropdown>