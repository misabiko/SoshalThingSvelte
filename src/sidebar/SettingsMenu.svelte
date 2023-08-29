<script lang='ts'>
	//TODO Make settings menu dynamically per-service
	import {extensionCheck, extensionContextStore, fetchExtension, fetchExtensionService} from "../services/extension.js"
	import {TwitterService} from '../services/twitter/service'
	import {PixivService} from "../services/pixiv/service.js";
	import {getServiceStorage, loadMainStorage, updateServiceStorage} from "../storages"
	import {updateMainStorage} from "../storages";

	//TODO Remove twitter auth stuff
	let oauthToken: string | undefined
	let oobPIN: string

	async function twitterRequestToken() {
		const response = await fetchExtensionService<{oauth_token: string}>(TwitterService.name, 'oauth1.0aRequestToken', undefined)
		oauthToken = response.json.oauth_token
	}

	async function twitterAccessToken() {
		const response = await fetchExtensionService<{soshalthing: true}>(TwitterService.name, 'oauth1.0aAccessToken', undefined, 'GET', {oauthVerifier: oobPIN})
		if (!response?.json.soshalthing)
			throw new Error(JSON.stringify(response, null, '\t'))
		oauthToken = undefined
		//TODO Add service and request to extensionCheck
		await extensionCheck()
	}

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

	const pixivStorage = getServiceStorage(PixivService.name)
	const mainStorage = loadMainStorage()
</script>

<label class='field'>
	Extension Id
	<input type='text' bind:value={$extensionContextStore.id} placeholder='Extension Id'/>
	<button on:click={extensionCheck}>Check Extension</button>
</label>

<label class='field'>
	Available: {$extensionContextStore.available}
</label>

<label class='field'>
	Mark as read in local storage
	<input
		type='checkbox'
		bind:checked={mainStorage.markAsReadLocal}
		on:input={e => updateMainStorage('markAsReadLocal', e.target.checked)}
	/>
</label>

{#if $extensionContextStore.hasAccessToken}
	<label class='field'>
		Twitter logged in
	</label>
{:else}
	<label class='field'>
		Twitter
		<button on:click={twitterRequestToken}>Request Token</button>
		{#if oauthToken}
			<a class='button' href={`https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`} target='_blank' rel='noreferrer'>
				Authenticate
			</a>
		{/if}
		<input type='text' bind:value={oobPIN}/>
		{#if oobPIN?.length}
			<button on:click={twitterAccessToken}>Get Access Token</button>
		{/if}
	</label>
{/if}

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
	Pixiv bookmark as private
	<input type='checkbox' checked={pixivStorage.privateBookmark ?? false} on:input={e => updateServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}/>
</label>