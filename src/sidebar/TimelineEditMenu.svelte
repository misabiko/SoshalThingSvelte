<script lang='ts'>
	import {defaultTimeline} from '../timelines'
	import type {TimelineData} from '../timelines'

	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let addTimeline: (data: TimelineData) => void

	enum TimelineAddTypes {
		Empty,
		//TODO Get timeline templates from services (like TwitterUserMedia)
	}

	let timelineAddType = TimelineAddTypes.Empty;
	let addDisabled = false
	$: {
		switch (timelineAddType) {
			//TODO case TimelineAddTypes.TwitterUser:
			// 	addDisabled = !username.length;
			// 	break;
			default:
				addDisabled = false;
				break;
		}
	}

	let title = ''
	let username = ''

	function getTimelineData() {
		switch (timelineAddType) {
			case TimelineAddTypes.Empty:
				return {
					...defaultTimeline(),
					title,
				};
			//TODO case TimelineAddTypes.TwitterUser:
			// 	return userTimeline();
		}
	}

	// function userTimeline() {
	// 	return newUserTimeline(TwitterService.name, {username, name: username, url: ''})
	// }
</script>

<label class='field'>
	<select bind:value={timelineAddType}>
		<option value={TimelineAddTypes.Empty}>Empty</option>
<!--TODO <option value={TimelineAddTypes.TwitterUser}>Twitter User</option>-->
	</select>

	{#if timelineAddType === TimelineAddTypes.Empty}
		<input bind:value={title} name='title'/>
	<!--TODO {:else if timelineAddType === TimelineAddTypes.TwitterUser}-->
	<!--	<input bind:value={username} name='username'/>-->
	{/if}
	<button
		on:click={() => {const data = getTimelineData(); if (data) setModalTimeline(data)}}
		disabled={addDisabled}
	>
		Add Modal Timeline
	</button>
	<button
		on:click={() => {const data = getTimelineData(); if (data) addTimeline(data)}}
		disabled={addDisabled}
	>
		Add Timeline
	</button>
</label>

