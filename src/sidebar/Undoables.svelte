<script lang='ts'>
	import {Button} from 'svelma'
	import {undoables} from "../undo.js";
</script>

<!--TODO Add undoable ids-->
{#each [...$undoables] as undoable, index (`${undoable.text}/${index}`)}
	<div class='box'>
		<p>{undoable.text}</p>
		<Button on:click={() => undoables.toggleDo(index)}>
			{undoable.undid ? 'Redo' : 'Undo'}
		</Button>
	</div>
{:else}
	<div class='box'>
		Nothing to undo
	</div>
{/each}