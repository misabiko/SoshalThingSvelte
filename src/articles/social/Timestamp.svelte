<script lang='ts'>
	import {shortTimestamp} from "../index.js";

	export let date: Date
</script>

<style lang='sass'>
	.timestamp
		float: right
</style>

<span class='timestamp'>
	<small title={date.toString()}>
		{shortTimestamp(date)}
	</small>
</span>