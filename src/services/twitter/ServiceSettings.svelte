<script lang='ts'>
	import {TwitterService} from './service';
	import {getServiceStorage, setServiceStorage} from '~/storages';

	const twitterStorage = getServiceStorage(TwitterService.name) ?? {};
</script>

<label class='field'>
	Twitter Bearer Token
	<input value="{twitterStorage.bearerToken || ''}" on:change="{e => setServiceStorage(TwitterService.name, 'bearerToken', e.currentTarget.value)}"/>
</label>