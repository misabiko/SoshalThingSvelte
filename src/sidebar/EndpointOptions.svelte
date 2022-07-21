<script lang='ts'>
	import {Endpoint} from '../services/endpoints'

	//TODO Make endpoint store
	export let endpoint: Endpoint

	function startAutoRefresh() {}
	function stopAutoRefresh() {}
</script>

<div class='block'>
	{endpoint.name}
	{#if endpoint.rateLimitInfo !== null}
		{@const timeLeft = Math.ceil(((endpoint.rateLimitInfo.reset * 1000) - Date.now()) / 60000)}
		<progress class="progress" value={endpoint.rateLimitInfo.remaining} max={endpoint.rateLimitInfo.limit}>
			{ `${Math.fround(endpoint.rateLimitInfo.remaining / endpoint.rateLimitInfo.limit * 1000) / 10}%` }
		</progress>
		{ `${timeLeft} minutes until reset`}
	{/if}
	<div class="field has-addons">
		{#if endpoint.isAutoRefreshing}
			<div class='control'>
				<button class='button' on:click={stopAutoRefresh}>
					Stop refreshing
				</button>
			</div>
			<div class='control'>
				<input class='input' type='number' value={endpoint.autoRefreshInterval} disabled>
			</div>
			<div class='control'>
				<button class='button is-static'>ms</button>
			</div>
		{:else}
			<div class='control'>
				<button class='button' on:click={startAutoRefresh}>
					Auto refresh
				</button>
			</div>
			<div class='control'>
				<input class='input' type='number' bind:value={endpoint.autoRefreshInterval}/>
			</div>
			<div class='control'>
				<button class='button is-static'>ms</button>
			</div>
		{/if}
	</div>
</div>