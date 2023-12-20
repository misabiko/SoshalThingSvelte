<script lang="ts">
	import {defaultTimelineView, type TimelineView} from '../timelines';
	import {updateMainStorage, updateMainStorageTimelineViews} from '../storages';
    import type {TimelineCollection} from "../timelines";
    import Dropdown from "../Dropdown.svelte";

    export let timelineViews: Record<string, TimelineView>
	export let timelineViewId: string
    export let timelines: TimelineCollection

    let newViewName = '';

    function addView() {
        if (newViewName.length === 0 || Object.hasOwn(timelineViews, newViewName))
            return;

        timelineViews[newViewName] = {
            timelineIds: [],
            fullscreen: {
                index: null,
                columnCount: null,
                container: null,
            },
        }

        updateMainStorageTimelineViews(timelineViews);
    }

    function addTimeline(view: string, timelineId: string) {
		timelineViews[view].timelineIds.push(timelineId);

        updateMainStorageTimelineViews(timelineViews);
    }

    function removeTimeline(view: string, index: number) {
        timelineViews[view].timelineIds.splice(index, 1);

        updateMainStorageTimelineViews(timelineViews);
	}

    function moveTimeline(view: string, index: number, up: boolean) {
        const removed = timelineViews[view].timelineIds.splice(index, 1);
        if (up)
            timelineViews[view].timelineIds.splice(index - 1, 0, removed[0]);
        else
            timelineViews[view].timelineIds.splice(index + 1, 0, removed[0]);

		timelineViews = timelineViews;

        updateMainStorageTimelineViews(timelineViews);
    }

    function replaceTimeline(view: string, index: number, newTimeline: string) {
        timelineViews[view].timelineIds.splice(index, 1, newTimeline);

        updateMainStorageTimelineViews(timelineViews);
    }

    function removeView(view: string) {
        delete timelineViews[view];

        updateMainStorageTimelineViews(timelineViews);
	}

	function setView(view: string) {
		timelineViewId = view;

		updateMainStorage('defaultTimelineView', view);
	}

</script>

<style>
	.timelineViewEditMenu {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>

<div class='timelineViewEditMenu'>
	{#each Object.entries(timelineViews) as [viewName, view]}
		{@const newTimelines = Object.keys(timelines).filter(t => !view.timelineIds.includes(t))}
		<div class='timelineViewEdit'>
			{viewName}
			<label class='field'>
				<button on:click={() => setView(viewName)}>Set View</button>
				<button on:click={() => removeView(viewName)}>Remove View</button>
			</label>
			{#each view.timelineIds as id, index (id)}
				<label>
					<select value={id} on:input={e => replaceTimeline(viewName, index, e.detail)}>
						<option value={id}>{id}</option>
						{#each newTimelines as newTimeline}
							<option value={newTimeline}>{newTimeline}</option>
						{/each}
					</select>
					{#if view.timelineIds.length > 1}
						<button on:click={() => moveTimeline(viewName, index, false)} disabled={index === view.timelineIds.length - 1}>↓</button>
						<button on:click={() => moveTimeline(viewName, index, true)} disabled={index === 0}>↑</button>
					{/if}
					<button on:click={() => removeTimeline(viewName, index)}>Remove</button>
				</label>
			{/each}
			{#if newTimelines.length}
				<Dropdown labelText='New timeline'>
					{#each newTimelines as id}
						<button on:click={() => addTimeline(viewName, id)}>{id}</button>
					{/each}
				</Dropdown>
			{/if}
		</div>
	{/each}

	<div>
		<input bind:value={newViewName} placeholder='Timeline View Name'/>
		<button on:click={addView} disabled={newViewName.length === 0 || Object.hasOwn(timelineViews, newViewName)}>Add new view</button>
	</div>
</div>