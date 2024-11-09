<script lang='ts'>
	import {PixivService} from './service';
	import {getServiceStorage, setServiceStorage} from '~/storages';

	const pixivStorage = getServiceStorage(PixivService.name)/*?? ''*/;
</script>

<!-- Get from document.getElementsByTagname('meta')[global].content thing -->
<label class='field'>
	Pixiv token
	<input value={pixivStorage.csrfToken ?? ''}
		onchange={e => (e.target as HTMLInputElement).value && setServiceStorage(PixivService.name, 'csrfToken', (e.target as HTMLInputElement).value)}
	/>
</label>
<label class='field'>
	<input type='checkbox' checked={pixivStorage.privateBookmark ?? false}
		oninput={e => setServiceStorage(PixivService.name, 'privateBookmark', (e.target as HTMLInputElement).checked)}
	/>
	Pixiv bookmark as private
</label>