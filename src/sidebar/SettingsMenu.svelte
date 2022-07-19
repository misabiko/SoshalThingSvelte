<script lang='ts'>
	import {Field, Input, Button} from 'svelma'
	import {extensionCheck, extensionContextStore, fetchExtension} from "../services/extension.js"
	import {TwitterService} from '../services/twitter/service'

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
</script>

<Field label='Extension Id' addons={false}>
	<Input type='text' bind:value={$extensionContextStore.id} placeholder='Extension Id'/>
	<Button on:click={extensionCheck}>Check Extension</Button>
</Field>
<Field label={`Available: ${$extensionContextStore.available}`}></Field>

{#if $extensionContextStore.hasAccessToken}
	<Field label='Twitter logged in'></Field>
{:else}
	<Field label='Twitter' addons={false}>
		<Button on:click={twitterRequestToken}>Request Token</Button>
		{#if oauthToken}
			<a class='button' href={`https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`} target='_blank'>
				Authenticate
			</a>
		{/if}
		<Input type='text' bind:value={oobPIN}/>
		{#if oobPIN?.length}
			<Button on:click={twitterAccessToken}>Get Access Token</Button>
		{/if}
	</Field>
{/if}