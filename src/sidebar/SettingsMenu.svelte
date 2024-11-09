<script lang='ts'>
	import { extensionCheck, extensionContextStore } from '~/services/extension.js';
	import { loadMainStorage } from '~/storages';
	import { updateMainStorage } from '~/storages';
	import { getServices } from '~/services/service';
	import ServiceSettings from '~/sidebar/ServiceSettings.svelte';

	const mainStorage = loadMainStorage();
</script>

<section>
	<label class='field'>
		Extension Id
		<input type='text' bind:value={$extensionContextStore.id} placeholder='Extension Id'/>
		<button onclick={extensionCheck}>Check Extension</button>
	</label>

	<div class='field'>
		Available: {$extensionContextStore.available}
	</div>

	<label class='field'>
		Mark as read in local storage
		<input
			type='checkbox'
			bind:checked={mainStorage.markAsReadLocal}
			oninput={e => updateMainStorage('markAsReadLocal', e.currentTarget.checked)}
		/>
	</label>
</section>

{#each Object.values(getServices()).filter(s => s.settings) as service}
	<section>
		<ServiceSettings {service}/>
	</section>
{/each}