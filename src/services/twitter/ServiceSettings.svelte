<script lang='ts'>
	import {TwitterService} from './service';
	import {getServiceStorage, updateServiceStorage} from '../../storages';

	const twitterStorage = getServiceStorage(TwitterService.name) ?? {};
</script>

<label class='field'>
	Twitter Bearer Token
	<input value={twitterStorage.bearerToken || ''} on:change={e => updateServiceStorage(TwitterService.name, 'bearerToken', e.target.value)}/>
</label>