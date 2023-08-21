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

	async function listTabs() {
		const response = await fetchExtension<any>('listTabs', {query: {url: '*://twitter.com/*'}});
		console.log(response);
	}

	async function twitterPageFetch() {
		const response = await fetchExtension<any>('twitterFetch', {tabId: 214361683, message: 'https://twitter.com/i/api/graphql/q94uRCEn65LZThakYcPT6g/TweetDetail?variables=%7B%22focalTweetId%22%3A%221693401486817181924%22%2C%22referrer%22%3A%22home%22%2C%22controller_data%22%3A%22DAACDAABDAABCgABCAAAQkAEAAEKAAKAAAAAAAEAAAoACQvMGaSTjF6FCAALAAAABA8ADAMAAAAZAQAEQEIAAAgAAAEAAAAAgAAAAAAAAAAAgAoADpI6QBn%2BaUXqCgAQ55orXvX%2F2pgAAAAA%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22rweb_lists_timeline_redesign_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Afalse%7D'});
		console.log(response)
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

<button on:click={listTabs}>List Tabs</button>
<button on:click={twitterPageFetch}>Twitter Page Fetch</button>

<label class='field'>
	Pixiv token
	<input value={pixivStorage.csrfToken} on:change={e => updateServiceStorage(PixivService.name, 'csrfToken', e.target.value)}/>
</label>
<label class='field'>
	Pixiv bookmark as private
	<input type='checkbox' checked={pixivStorage.privateBookmark ?? false} on:input={e => updateServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}/>
</label>