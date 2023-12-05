<script lang='ts'>
	import {defaultTimeline, newUserTimeline} from '../timelines'
	import type {TimelineData} from '../timelines'
	import type Timeline from '../timelines/Timeline.svelte'
	import {TwitterService} from '../services/twitter/service'
	import {MisskeyService} from "../services/misskey/service";
	import {RefreshType} from "../services/endpoints";

	let {
		setModalTimeline,
		addTimeline,
	} = $props<{
		setModalTimeline: (data: TimelineData, width?: number) => void,
		addTimeline: (data: TimelineData) => void,
	}>();

	enum TimelineAddTypes {
		Empty,
		TwitterUser,
	}

	let timelineAddType = $state<TimelineAddTypes.Empty>();
	let addDisabled = $state(false)
	$effect(() => {
		switch (timelineAddType) {
			case TimelineAddTypes.TwitterUser:
				addDisabled = !username.length;
				break;
			default:
				addDisabled = false;
				break;
		}
	});

	let title = $state('');
	let username = $state('');

	function getTimelineData() {
		switch (timelineAddType) {
			case TimelineAddTypes.Empty:
				return {
					...defaultTimeline(),
					title,
				};
			case TimelineAddTypes.TwitterUser:
				return userTimeline();
		}
	}

	function userTimeline() {
		//TODO Have per-service UI or per-service newUserTimeline()
		return newUserTimeline(TwitterService.name, {username, name: username, url: ''})
	}
</script>

<label class='field'>
	Add Timeline
	<select bind:value={timelineAddType}>
		<option value={TimelineAddTypes.Empty}>Empty</option>
		<option value={TimelineAddTypes.TwitterUser}>Twitter User</option>
	</select>

	{#if timelineAddType === TimelineAddTypes.Empty}
		<input bind:value={title} name='title'/>
	{:else if timelineAddType === TimelineAddTypes.TwitterUser}
		<input bind:value={username} name='username'/>
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

