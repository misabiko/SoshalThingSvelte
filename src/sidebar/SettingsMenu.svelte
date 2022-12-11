<script lang='ts'>
	import {Field, Input, Button, Switch} from 'svelma'
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

<Field label='Extension Id' addons={false}>
	<Input type='text' bind:value={$extensionContextStore.id} placeholder='Extension Id'/>
	<Button on:click={extensionCheck}>Check Extension</Button>
</Field>
<Field label={`Available: ${$extensionContextStore.available}`}></Field>

<Field label='Mark as read in local storage' addons={false}>
	<Switch checked={mainStorage.markAsReadLocal ?? false} on:input={e => updateMainStorage('markAsReadLocal', e.target.checked)}/>
</Field>

{#if $extensionContextStore.hasAccessToken}
	<Field label='Twitter logged in'></Field>
{:else}
	<Field label='Twitter' addons={false}>
		<Button on:click={twitterRequestToken}>Request Token</Button>
		{#if oauthToken}
			<a class='button' href={`https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`} target='_blank' rel='noreferrer'>
				Authenticate
			</a>
		{/if}
		<Input type='text' bind:value={oobPIN}/>
		{#if oobPIN?.length}
			<Button on:click={twitterAccessToken}>Get Access Token</Button>
		{/if}
	</Field>
{/if}

<Field label='Pixiv token' addons={false}>
	<Input value={pixivStorage.csrfToken} on:change={e => updateServiceStorage(PixivService.name, 'csrfToken', e.target.value)}/>
</Field>
<Field label='Pixiv bookmark as private' addons={false}>
	<Switch checked={pixivStorage.privateBookmark ?? false} on:input={e => updateServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}/>
</Field>