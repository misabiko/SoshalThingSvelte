<script lang='ts'>
	import {Field, Input, Button} from 'svelma'
	import {defaultTimeline} from '../timelines'
	import type {TimelineData} from '../timelines'
	import Timeline from '../timelines/Timeline.svelte'
	import {everyRefreshType} from '../services/endpoints'
	import {defaultFilterInstances} from '../filters'
	import MasonryContainer from '../containers/MasonryContainer.svelte'
	import {TwitterService} from '../services/twitter/service'

	export let setModalTimeline: (data: Partial<TimelineData>) => void
	export let addTimeline: (data: Timeline) => void

	let username = ''

	function newUserTimeline(): TimelineData {
		const endpointConstructor = TwitterService.userEndpoint

		return {
			...defaultTimeline(),
			title: username,
			endpoints: [{
				endpoint: endpointConstructor(username),
				refreshTypes: everyRefreshType,
				filters: [],
			}],
			filters: [
				...defaultFilterInstances,
				{
					filter: {type: 'media'},
					enabled: true,
					inverted: false,
				},
				{
					filter: {type: 'noRef'},
					enabled: true,
					inverted: false,
				}
			],
			container: MasonryContainer,
			columnCount: 3,
		}
	}
</script>

<Field label='Username' addons={false}>
	<Input bind:value={username}/>
	<Button on:click={() => setModalTimeline(newUserTimeline())} disabled={!username.length}>
		Add Modal Timeline
	</Button>
	<Button on:click={() => addTimeline(newUserTimeline())} disabled={!username.length}>
		Add Timeline
	</Button>
</Field>