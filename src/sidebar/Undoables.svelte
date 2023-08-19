<script lang='ts'>
	import {undoables} from "../undo";
	import {defaultTimeline, type TimelineData} from '../timelines'
	import {get} from 'svelte/store'

	export let setModalTimeline: (data: TimelineData, width?: number) => void

	function modalTimeline() {
		setModalTimeline({
			...defaultTimeline(get(undoables).map(u => u.articleIdPair)),
			title: 'Undoables',
			filters: [],
		})
	}
</script>

<div class='box'>
	<!--<Button on:click={modalTimeline}>
		Open Timeline
	</Button>-->
	<!--TODO Add undoable ids-->
	{#each [...$undoables] as undoable, index (`${undoable.text}/${index}`)}
			<p>{undoable.text}</p>
			<!--<Button on:click={() => undoables.toggleDo(index)}>
				{undoable.undid ? 'Redo' : 'Undo'}
			</Button>-->
	{:else}
		Nothing to undo
	{/each}
</div>