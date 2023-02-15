<script lang="ts">
    import type {TimelineView} from "../timelines";
    import {Button, Field, Input, Select} from "svelma";
    import {updateMainStorage} from "../storages";
    import type {TimelineCollection} from "../timelines";
    import Dropdown from "../Dropdown.svelte";

    export let timelineViews: { [name: string]: TimelineView }
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

        updateMainStorage('timelineViews', timelineViews);
    }

    function addTimeline(view: string, timelineId: string) {
		timelineViews[view].timelineIds.push(timelineId);

        updateMainStorage('timelineViews', timelineViews);
    }

    function removeTimeline(view: string, index: number) {
        timelineViews[view].timelineIds.splice(index, 1);

        updateMainStorage('timelineViews', timelineViews);
	}

    function moveTimeline(view: string, index: number, up: boolean) {
        const removed = timelineViews[view].timelineIds.splice(index, 1);
        if (up)
            timelineViews[view].timelineIds.splice(index - 1, 0, removed[0]);
        else
            timelineViews[view].timelineIds.splice(index + 1, 0, removed[0]);

        updateMainStorage('timelineViews', timelineViews);
    }

    function replaceTimeline(view: string, index: number, newTimeline: string) {
        timelineViews[view].timelineIds.splice(index, 1, newTimeline);

        updateMainStorage('timelineViews', timelineViews);
    }

    function removeView(view: string) {
        delete timelineViews[view];

        updateMainStorage('timelineViews', timelineViews);
	}
</script>

{#each Object.entries(timelineViews) as [viewName, timelineView]}
	<Button on:click={() => removeView(viewName)}>Remove View</Button>
	<Field label={viewName} addons={false}>
		{@const newTimelines = Object.keys(timelines).filter(t => !timelineView.timelineIds.includes(t))}
		{#each timelineView.timelineIds as id, index (id)}
			<div class='buttons has-addons'>
				<Select selected={id} on:input={e => replaceTimeline(viewName, index, e.detail)} nativeSize={0}>
					<option value={id}>{id}</option>
					{#each newTimelines as newTimeline}
						<option value={newTimeline}>{newTimeline}</option>
					{/each}
				</Select>
				{#if timelineView.timelineIds.length > 1}
					<Button on:click={() => moveTimeline(viewName, index, false)} disabled={index === timelineView.timelineIds.length - 1}>↓</Button>
					<Button on:click={() => moveTimeline(viewName, index, true)} disabled={index === 0}>↑</Button>
				{/if}
				<Button on:click={() => removeTimeline(viewName, index)}>Remove</Button>
			</div>
		{/each}
		{#if newTimelines.length}
			<Dropdown labelText='New timeline'>
				{#each newTimelines as id}
					<div class='control'>
						<Button on:click={() => addTimeline(viewName, id)}>{id}</Button>
					</div>
				{/each}
			</Dropdown>
		{/if}
	</Field>
{/each}
<Field addons={true}>
	<Input bind:value={newViewName}></Input>
	<Button on:click={addView}>Add</Button>
</Field>
