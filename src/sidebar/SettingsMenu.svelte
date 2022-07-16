<script lang='ts'>
	import {Field, Input, Button} from 'svelma'
	import {extensionCheck, extensionContextStore} from "../services/extension.js"
</script>

<Field label='Extension Id'>
	<Input type='text' bind:value={$extensionContextStore.id} placeholder='Extension Id'/>
	<Button on:click={extensionCheck}>Check Extension</Button>
</Field>
<Field label='Available'>
	<Input type='text' disabled value={$extensionContextStore.available}/>
</Field>