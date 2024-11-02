<script lang='ts'>
	import {shortTimestamp} from '../index';

	let {
		date,
	}: {
		date: Date
	} = $props();
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