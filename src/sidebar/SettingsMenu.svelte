<script lang='ts'>
	//TODO Make settings menu dynamically per-service
	import {extensionCheck, extensionContextStore, fetchExtension, fetchExtensionService} from "../services/extension.js"
	import {TwitterService} from '../services/twitter/service'
	import {PixivService} from '../services/pixiv/service';
	import {getServiceStorage, loadMainStorage, updateServiceStorage} from "../storages"
	import {updateMainStorage} from "../storages";

	let tabId: number | null = null;

	async function listTabs() {
		const response = await fetchExtension<any>('listTabs', {query: {url: '*://twitter.com/*'}});
		console.log(response);

		if (Array.isArray(response) && response.length > 0)
			tabId = response[0].id;
	}

	async function twitterPageFetch() {
		if (tabId === null) {
			console.log('Tab id not set');
			return;
		}

		const response = await fetchExtension<any>('twitterFetch', {tabId, message: {
			soshalthing: true,
			request: 'getPageHTML',
		}});
		const html = document.createElement('html');
		html.innerHTML = response;
		console.log(html.getElementsByTagName('article'));
	}

	const twitterStorage = getServiceStorage(TwitterService.name) ?? '';
	const pixivStorage = getServiceStorage(PixivService.name) ?? '';
	const mainStorage = loadMainStorage();
</script>

<label class='field'>
	Extension Id
	<input type='text' bind:value={$extensionContextStore.id} placeholder='Extension Id'/>
	<button on:click={extensionCheck}>Check Extension</button>
</label>

<div class='field'>
	Available: {$extensionContextStore.available}
</div>

<label class='field'>
	Mark as read in local storage
	<input
		type='checkbox'
		bind:checked={mainStorage.markAsReadLocal}
		on:input={e => updateMainStorage('markAsReadLocal', e.target.checked)}
	/>
</label>

<label class='field'>
	Twitter Bearer Token
	<input value={twitterStorage.csrfToken} on:change={e => updateServiceStorage(TwitterService.name, 'bearerToken', e.target.value)}/>
</label>

<div>
	<button on:click={listTabs}>List Tabs</button>
	<p>TabId: {tabId}</p>
	<button on:click={twitterPageFetch}>Twitter Page Fetch</button>
</div>

<label class='field'>
	Pixiv token
	<input value={pixivStorage.csrfToken} on:change={e => updateServiceStorage(PixivService.name, 'csrfToken', e.target.value)}/>
</label>
<label class='field'>
	<input type='checkbox' checked={pixivStorage.privateBookmark ?? false} on:input={e => updateServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}/>
	Pixiv bookmark as private
</label>