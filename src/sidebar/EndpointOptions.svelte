<script lang='ts'>
	import {Endpoint} from "../services/service"

	//TODO Make endpoint store
	export let endpoint: Endpoint

	function startAutoRefresh() {}
	function stopAutoRefresh() {}
	function setAutoRefreshInterval(e: InputEvent) {}
</script>

<div class='block'>
	{endpoint.name}
	{#if endpoint.rateLimitInfo !== null}
		{@const timeLeft = Math.ceil(((endpoint.rateLimitInfo.reset * 1000.0) - Date.now()) / 60000.0)}
		<progress class="progress" value={endpoint.rateLimitInfo.remaining} max={endpoint.rateLimitInfo.limit}>
			{ `${Math.fround(endpoint.rateLimitInfo.remaining / endpoint.rateLimitInfo.limit * 1000.0) / 10.0}%` }
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
				<a class='button is-static'>ms</a>
			</div>
		{:else}
			<div class='control'>
				<button class='button' on:click={startAutoRefresh}>
					Auto refresh
				</button>
			</div>
			<div class='control'>
				<input class='input' type='number' value={endpoint.autoRefreshInterval} on:input={setAutoRefreshInterval}/>
			</div>
			<div class='control'>
				<a class='button is-static'>ms</a>
			</div>
		{/if}
	</div>
</div>