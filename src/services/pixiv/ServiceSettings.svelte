<script>
	import {PixivService} from './service';
	import {getServiceStorage, setServiceStorage} from '~/storages';

	const pixivStorage = getServiceStorage(PixivService.name) ?? '';
</script>

<!-- Get from document.getElementsByTagname('meta')[global].content thing -->
<label class='field'>
	Pixiv token
	<input value="{pixivStorage.csrfToken ?? ''}"
		onchange="{e => setServiceStorage(PixivService.name, 'csrfToken', e.target.value)}"
	/>
</label>
<label class='field'>
	<input type='checkbox' checked='{pixivStorage.privateBookmark ?? false}'
		oninput="{e => setServiceStorage(PixivService.name, 'privateBookmark', e.target.checked)}"
	/>
	Pixiv bookmark as private
</label>