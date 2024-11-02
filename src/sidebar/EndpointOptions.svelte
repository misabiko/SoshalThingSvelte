<script lang='ts'>
	import {Endpoint} from '~/services/endpoints';
	import {startAutoRefresh, stopAutoRefresh} from '~/services/endpoints';
	import type {Writable} from 'svelte/store';

	let {
		endpoint,
	}: {
		endpoint: Writable<Endpoint>
	} = $props();

	let service = ($endpoint.constructor as typeof Endpoint).service;
</script>

<div class='block endpointOptions'>
	{service} {$endpoint.name}
	{#if $endpoint.rateLimitInfo !== null}
		{@const timeLeft = Math.ceil((($endpoint.rateLimitInfo.reset * 1000) - Date.now()) / 60000)}
		<progress class='progress' value={$endpoint.rateLimitInfo.remaining} max={$endpoint.rateLimitInfo.limit}>
			{ `${Math.fround($endpoint.rateLimitInfo.remaining / $endpoint.rateLimitInfo.limit * 1000) / 10}%` }
		</progress>
		{ `${timeLeft} minutes until reset`}
	{/if}
	<div class='field has-addons'>
		{#if $endpoint.autoRefreshId !== null}
			<button class='button' onclick={() => stopAutoRefresh($endpoint.name)}>
				Stop refreshing
			</button>
			<input class='input' type='number' value={$endpoint.autoRefreshInterval} disabled>
			<button class='button is-static'>ms</button>
		{:else}
			<button class='button' onclick={() => startAutoRefresh($endpoint.name)}>
				Auto refresh
			</button>
			<!-- TODO Use seconds or minutes (or dynamic thing) -->
			<input class='input' type='number' bind:value={$endpoint.autoRefreshInterval}/>
			<!-- TODO Don't wrap unit on next line -->
			<button class='button is-static'>ms</button>
			<!-- TODO Show timer until next auto refresh (updated every few seconds) -->
		{/if}
	</div>
</div>