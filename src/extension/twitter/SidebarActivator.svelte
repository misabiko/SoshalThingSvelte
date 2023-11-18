<script lang="ts">
    import { faCrow } from "@fortawesome/free-solid-svg-icons";
	import portal from "../../usePortal";
	import Fa from 'svelte-fa';

	export let favviewerHidden: boolean;

	const activatorMount = document.querySelector('nav[aria-label="Primary"]');
	if (activatorMount === null)
		throw new Error("Could not find activator mount");
	const sidebarMenuButton = document.querySelector(
		'div[data-testid="AppTabBar_More_Menu"]'
	);
	if (sidebarMenuButton === null)
		throw new Error("Could not find sidebar menu button");

	let hovered = false;
</script>

<style>
	.svelte-fa {
		padding: 0 3px;
	}
</style>

<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<a
	use:portal={{ target: activatorMount, insertBefore: sidebarMenuButton }}
	id="favvieweractivator"
	class={activatorMount.children[0].className}
	on:click={() => (favviewerHidden = !favviewerHidden)}
	on:mouseenter={() => {hovered = true}}
	on:mouseleave={() => {hovered = false}}
>
	<div
		class="css-1dbjc4n r-1awozwy r-sdzlij r-18u37iz r-1777fci r-dnmrzs r-xyw6el r-o7ynqc r-6416eg"
		class:r-3al2xr={hovered}
	>
		<div class="css-1dbjc4n">
			<Fa icon={faCrow} flip='horizontal'/>
		</div>
		<div
			dir="ltr"
			class="css-901oao css-1hf3ou5 r-vlxjld r-37j5jr r-adyw6z r-16dba41 r-135wba7 r-1joea0r r-88pszg r-bcqeeo r-qvutc0"
			style="text-overflow: unset;"
		>
			<span
				class="css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"
				style="text-overflow: unset;">SoshalThing</span
			>
		</div>
	</div>
</a>
