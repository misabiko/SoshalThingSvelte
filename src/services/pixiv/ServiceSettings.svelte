<script>
	import {PixivService} from './service';
	import {getServiceStorage, updateServiceStorage} from '../../storages';

	const pixivStorage = getServiceStorage(PixivService.name) ?? '';
</script>

<!-- Get from document.getElementsByTagname('meta')[global].content thing -->
<label class='field'>
	Pixiv token
	<input value={pixivStorage.csrfToken ?? ''}
		   on:change={e => updateServiceStorage(PixivService.name, 'csrfToken', e.target.value)}
	/>
</label>
<label class='field'>
	<input type='checkbox' checked={pixivStorage.privateBookmark ?? false}
		   on:input={e => updateServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}
	/>
	Pixiv bookmark as private
</label>