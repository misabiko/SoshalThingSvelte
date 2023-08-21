<script lang='ts'>
	import {extensionCheck, extensionContextStore, fetchExtension} from "../services/extension.js"
	import {TwitterService} from '../services/twitter/service'
	import {PixivService} from "../services/pixiv/service.js";
	import {getServiceStorage, loadMainStorage, updateServiceStorage} from "../storages"
	import {updateMainStorage} from "../storages";

	let oauthToken: string | undefined
	let oobPIN: string

	async function twitterRequestToken() {
		const response = await fetchExtension<{oauth_token: string}>(TwitterService.name, 'oauth1.0aRequestToken', undefined)
		oauthToken = response.json.oauth_token
	}

	async function twitterAccessToken() {
		const response = await fetchExtension<{soshalthing: true}>(TwitterService.name, 'oauth1.0aAccessToken', undefined, 'GET', {oauthVerifier: oobPIN})
		if (!response?.json.soshalthing)
			throw new Error(JSON.stringify(response, null, '\t'))
		oauthToken = undefined
		//TODO Add service and request to extensionCheck
		await extensionCheck()
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

<label class='field'>
	Pixiv token
	<input value={pixivStorage.csrfToken} on:change={e => updateServiceStorage(PixivService.name, 'csrfToken', e.target.value)}/>
</label>
<label class='field'>
	Pixiv bookmark as private
	<input type='checkbox' checked={pixivStorage.privateBookmark ?? false} on:input={e => updateServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}/>
</label>