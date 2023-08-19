<script lang='ts'>
	import {defaultTimeline, newUserTimeline} from '../timelines'
	import type {TimelineData} from '../timelines'
	import type Timeline from '../timelines/Timeline.svelte'
	import {TwitterService} from '../services/twitter/service'
	import {MisskeyService} from "../services/misskey/service";
	import {RefreshType} from "../services/endpoints";

	export let setModalTimeline: (data: TimelineData, width?: number) => void
	export let addTimeline: (data: Timeline) => void

	enum TimelineAddTypes {
		Empty,
		TwitterUser,
	}

	let timelineAddType = TimelineAddTypes.Empty;
	let addDisabled = false
	$: {
		switch (timelineAddType) {
			case TimelineAddTypes.TwitterUser:
				addDisabled = !username.length;
				break;
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
			case TimelineAddTypes.TwitterUser:
				return userTimeline();
		}
	}

	function userTimeline() {
		//TODO Have per-service UI or per-service newUserTimeline()
		return newUserTimeline(TwitterService.name, {username, name: username, url: ''})
	}
</script>

<!--
<Field label='Username' addons={false}>
	<Select bind:selected={timelineAddType} nativeSize={0}>
		<option value={TimelineAddTypes.Empty}>Empty</option>
		<option value={TimelineAddTypes.TwitterUser}>Twitter User</option>
	</Select>
	{#if timelineAddType === TimelineAddTypes.Empty}
		<Input bind:value={title}/>
	{:else if timelineAddType === TimelineAddTypes.TwitterUser}
		<Input bind:value={username}/>
	{/if}
	<Button
		on:click={() => {const data = getTimelineData(); if (data) setModalTimeline(data)}}
		disabled={addDisabled}
	>
		Add Modal Timeline
	</Button>
	<Button
		on:click={() => {const data = getTimelineData(); if (data) addTimeline(data)}}
		disabled={addDisabled}
	>
		Add Timeline
	</Button>
</Field>-->
