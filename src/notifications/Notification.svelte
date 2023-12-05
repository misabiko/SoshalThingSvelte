<script lang='ts'>
	import type {Notification} from './store'
	import {notifications} from './store'

	let { data, id } = $props<{data: Notification, id: string}>();
</script>

<div class='notification'>
	<button class='delete' on:click={() => notifications.delete(id)}></button>
	<div class='block'>
		<span>{data.text}</span>
	</div>
</div>