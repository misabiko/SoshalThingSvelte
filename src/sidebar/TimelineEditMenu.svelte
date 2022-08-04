<script lang='ts'>
	import {Field, Input, Button} from 'svelma'
	import {newUserTimeline} from '../timelines'
	import type {TimelineData} from '../timelines'
	import Timeline from '../timelines/Timeline.svelte'
	import {TwitterService} from '../services/twitter/service'

	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let addTimeline: (data: Timeline) => void

	let username = ''

	function userTimeline() {
		return newUserTimeline(TwitterService.name, username)
	}
</script>

<Field label='Username' addons={false}>
	<Input bind:value={username}/>
	<Button
		on:click={() => {const data = userTimeline(); if (data) setModalTimeline(data)}}
		disabled={!username.length}
	>
		Add Modal Timeline
	</Button>
	<Button
		on:click={() => {const data = userTimeline(); if (data) addTimeline(data)}}
		disabled={!username.length}
	>
		Add Timeline
	</Button>
</Field>