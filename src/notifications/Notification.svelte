<script lang='ts'>
	import type {Notification} from './store';
	import {notifications} from './store';
	import Fa from 'svelte-fa';
	import {faCircleXmark} from '@fortawesome/free-solid-svg-icons';

	export let data: Notification;
	export let id: string;
</script>

<style>
	.notification {
		background-color: var(--dark);
		padding: 0.8rem;
		border-radius: 6px;
	}
</style>

<div class='notification'>
	<span>{data.text}</span>

	<button class='deleteButton borderless-button' on:click={() => notifications.delete(id)}>
		<span class='icon'>
			<Fa icon={faCircleXmark}/>
		</span>
	</button>
</div>