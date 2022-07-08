<script lang='ts'>
	import type {Notification} from './store'
	import {notifications} from './store'

	export let data: Notification
	export let id: string
</script>

<div class='notification'>
	<button class='delete' on:click={() => notifications.delete(id)}></button>
	<div class='block'>
		<span>{data.text}</span>
		<span>Id: {id}</span>
	</div>
</div>