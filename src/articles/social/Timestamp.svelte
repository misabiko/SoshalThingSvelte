<script lang='ts'>
	import {shortTimestamp} from "../index";

	export let date: Date
</script>

<style>
	.timestamp {
		float: right;
	}
</style>

<span class='timestamp'>
	<small title={date.toString()}>
		{shortTimestamp(date)}
	</small>
</span>