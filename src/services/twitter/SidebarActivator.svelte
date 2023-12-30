<script lang="ts">
    import { faCrow } from '@fortawesome/free-solid-svg-icons';
	import portal from '../../usePortal';
	import Fa from 'svelte-fa';

	export let favviewerHidden: boolean;

	const activatorMount = document.querySelector('nav[aria-label="Primary"]');
	if (activatorMount === null)
		throw new Error('Could not find activator mount');
	const sidebarMenuButton = document.querySelector(
		'div[data-testid="AppTabBar_More_Menu"]'
	);
	if (sidebarMenuButton === null)
		throw new Error('Could not find sidebar menu button');

	let hovered = false;

	//7 should be the "buy premium" button, which least probable to be selected
	const sampleMenuItem = activatorMount.children[7];
</script>

<style>
	:global(.twitterMenuIcon > svg) {
		padding: 0 3px;
	}

	.soshalHovered {
		background-color: rgba(231, 233, 234, 0.1);
	}
</style>

<!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
<a
	use:portal={{ target: activatorMount, insertBefore: sidebarMenuButton }}
	id="favvieweractivator"
	class={sampleMenuItem.className}
	on:click={() => (favviewerHidden = !favviewerHidden)}
	on:mouseenter={() => {hovered = true;}}
	on:mouseleave={() => {hovered = false;}}
>
	<div
		class={sampleMenuItem?.firstElementChild?.className}
		class:soshalHovered={hovered}
	>
		<div class={sampleMenuItem?.firstElementChild?.firstElementChild?.className + ' twitterMenuIcon'}>
			<Fa icon={faCrow} flip='horizontal'/>
		</div>
		<div
			dir="ltr"
			class={sampleMenuItem?.firstElementChild?.children[1]?.className}
			style="text-overflow: unset;"
		>
			<span
				class={sampleMenuItem?.firstElementChild?.children[1]?.firstElementChild?.className}
				style="text-overflow: unset;">SoshalThing</span
			>
		</div>
	</div>
</a>
