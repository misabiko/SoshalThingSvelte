<script lang='ts'>
	import {defaultTimeline, newUserTimeline} from '~/timelines';
	import type {TimelineData} from '~/timelines';
	import {getServices} from '~/services/service';

	export let setModalTimeline: (data: TimelineData, width?: number) => void;
	export let addTimeline: (data: TimelineData) => void;

	enum TimelineAddTypes {
		Empty,
		//TODO Get timeline templates from services (like TwitterUserMedia)
		User,
	}

	//TODO Should be a store
	let timelineAddType = TimelineAddTypes.Empty;
	let addDisabled = false;
	$: {
		switch (timelineAddType) {
			case TimelineAddTypes.User:
				try {
					addDisabled = !username.length || !JSON.parse(username)?.name?.length;
					//TODO Debug why prefix is ignored
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				}catch (_e) {
					addDisabled = true;
				}
				break;
			default:
				addDisabled = false;
				break;
		}
	}

	let title = '';
	let username = '';
	let userServices = Object.entries(getServices()).filter(([_, s]) => s.userEndpoint !== null);
	let userService = userServices[0][0];

	function getTimelineData() {
		switch (timelineAddType) {
			case TimelineAddTypes.Empty:
				return defaultTimeline({
					title,
				});
			case TimelineAddTypes.User:
				return newUserTimeline(userService, JSON.parse(username));
		}
	}
</script>

<label class='field'>
	<select bind:value={timelineAddType}>
		<option value={TimelineAddTypes.Empty}>Empty</option>
		<option value={TimelineAddTypes.User}>User</option>
	</select>

	{#if timelineAddType === TimelineAddTypes.Empty}
		<input bind:value={title} name='title'/>
	{:else if timelineAddType === TimelineAddTypes.User}
		<select bind:value={userService}>
			{#each userServices as [service, _]}
				<option value={service}>{service}</option>
			{/each}
		</select>
		<input bind:value={username} name='username'/>
	{/if}
	<button
		onclick='{() => {const data = getTimelineData(); if (data) setModalTimeline(data);}}'
		disabled={addDisabled}
	>
		Add Modal Timeline
	</button>
	<button
		onclick='{() => {const data = getTimelineData(); if (data) addTimeline(data);}}'
		disabled={addDisabled}
	>
		Add Timeline
	</button>
</label>