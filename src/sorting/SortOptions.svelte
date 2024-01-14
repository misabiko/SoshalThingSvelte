<script lang='ts'>
	import {methodName, type SortInfo, SortMethod} from './index';
	import Dropdown from '../Dropdown.svelte';
	import {directionLabel, genericSortMethods} from './index';
	import {getServices, type SortMethodInfo} from '~/services/service';
	import {updateTimelinesStorageSortInfo} from '~/storages';
	import type {Writable} from 'svelte/store';

	export let timelineId: string | null;
	export let sortInfo: SortInfo;
	export let articlesOrder: Writable<null | string[]>;
	$: {
		if (timelineId !== null)
			updateTimelinesStorageSortInfo(timelineId, sortInfo);
	}
	export let sortOnce: (method: SortMethod, reversed: boolean) => void;

	//[ServiceName, MethodName, MethodInfo][]
	const serviceSortMethods: {
		service: string
		method: string
		methodInfo: SortMethodInfo
	}[] = Object.values(getServices()).flatMap(s => Object.entries(s.sortMethods).map(m => ({
		service: s.name,
		method: m[0],
		methodInfo: m[1]
	})));

	let currentMethodName: string;
	$: {
		switch (sortInfo.method) {
			case null:
			case undefined:
				currentMethodName = 'Unsorted';
				break;
			case SortMethod.Custom:
				if (sortInfo.customMethod === null)
					throw new Error('Custom sort method is null');
				currentMethodName = `${sortInfo.customMethod.service} - ${getServices()[sortInfo.customMethod.service].sortMethods[sortInfo.customMethod.method].name}`;
				break;
			default:
				currentMethodName = methodName(sortInfo.method);
		}
	}
</script>

<div class='block field has-addons'>
	<label class='label'>
		Sort Method
		<Dropdown labelText={currentMethodName}>
			{#each genericSortMethods as method}
				{#each [false, true] as reversed}
					<button
						class='dropdown-item'
						on:click={() => {
							sortInfo.method = method;
							sortInfo.customMethod = null;
							sortInfo.reversed = reversed;
							$articlesOrder = null;
						}}
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
								method: method.method,
								service: method.service
							};
							sortInfo.reversed = reversed;
							$articlesOrder = null;
						}}
					>
						{ `${method.methodInfo.name} - ${method.methodInfo.directionLabel(reversed)}` }
					</button>
				{/each}
			{/each}
			<button class='dropdown-item' on:click={() => {
				sortInfo.method = null;
				$articlesOrder = null;
			}}>
				Unsorted
			</button>
		</Dropdown>
		<button class='button' on:click={() => sortInfo.reversed = !sortInfo.reversed}>
			{#if sortInfo.method !== null}
				{directionLabel(sortInfo.method, sortInfo.reversed)}
			{:else}
				{sortInfo.reversed ? 'Reversed' : 'Normal'}
			{/if}
		</button>
		{#if sortInfo.method === null}
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