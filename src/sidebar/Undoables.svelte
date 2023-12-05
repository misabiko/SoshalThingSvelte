<script lang='ts'>
	import {undoables} from "../undo";
	import {defaultTimeline, type TimelineData} from '../timelines'
	import {get} from 'svelte/store'

	let { setModalTimeline } = $props<{
		setModalTimeline: (data: TimelineData, width?: number) => void,
	}>();

	function modalTimeline() {
		setModalTimeline({
			...defaultTimeline(get(undoables).map(u => u.articleIdPair)),
			title: 'Undoables',
			filters: [],
		})
	}
</script>

<section>
	<button on:click={modalTimeline}>
		Open Timeline
	</button>
	<!--TODO Add undoable ids-->
	{#each [...$undoables] as undoable, index (`${undoable.text}/${index}`)}
			<p>{undoable.text}</p>
			<button on:click={() => undoables.toggleDo(index)}>
				{undoable.undid ? 'Redo' : 'Undo'}
			</button>
	{:else}
		Nothing to undo
	{/each}
</section>