<script lang='ts'>
	import {TwitterService} from './service';
	import {getServiceStorage, setServiceStorage, updateServiceStorageCallback} from '~/storages';

	const twitterStorage = getServiceStorage(TwitterService.name) ?? {};

	function updateQueryId(queryId: string, value: string) {
		updateServiceStorageCallback(TwitterService.name, storage => {
			if (!storage.queryIds)
				storage.queryIds = {};

			storage.queryIds[queryId] = value;

			return storage;
		});
	}
	const queryNames = [
		'HomeTimeline',
		'HomeLatestTimeline',
		'UserTweets',
		'UserMedia',
		'Likes',
		'ListLatestTweetsTimeline',
		'SearchTimeline',
	];
</script>

<label class='field'>
	Twitter Bearer Token
	<input value="{twitterStorage.bearerToken || ''}" onchange="{e => setServiceStorage(TwitterService.name, 'bearerToken', e.currentTarget.value)}"/>
</label>

<div id='twitterEndpointQueryIds'>
	{#each queryNames as queryName}
		<label class='field'>
			{queryName}
			<input value="{twitterStorage.queryIds?.[queryName] || ''}" onchange='{e => updateQueryId(queryName, e.currentTarget.value)}'/>
		</label>
	{/each}
</div>