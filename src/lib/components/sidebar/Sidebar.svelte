<script>
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faAngleDoubleLeft, faAngleDoubleRight, faPlus, faCog } from '@fortawesome/free-solid-svg-icons';
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import EndpointOptions from "./EndpointOptions.svelte";

	let expanded = false;
</script>

<style lang='sass' global>
	@use '../../styles/core' as *

	#sidebar
		background-color: $dark
		z-index: 1
		display: flex

	.collapse-content
		height: 100%

	#sidebarButtons
		width: 60px
		padding: 1rem 0
		text-align: center
		display: flex
		flex-direction: column
		justify-content: space-between

		& > div
			display: flex
			flex-direction: column

		button
			@include borderless-button
			height: 45px

			&:not(:last-child)
				margin-bottom: 1rem

			span
				vertical-align: middle

	.sidebarMenu
		width: $sidebar-menu-width
		height: 100%
		padding: 1rem
		background-color: $scheme-main-ter
		overflow-y: auto

		&::-webkit-scrollbar-thumb
			background-color: $dark
</style>

<nav id='sidebar'>
	{#if expanded}
		<div class='sidebarMenu'>
			<div class='box'>
				<EndpointOptions/>
			</div>
		</div>
	{/if}
	<div id='sidebarButtons'>
		<div>
			<button title="Expand sidebar" on:click='{() => expanded = !expanded}'>
				<Fa icon={expanded ? faAngleDoubleLeft : faAngleDoubleRight} size='2x'/>
			</button>
			<button title="Add new timeline"> <!-- onclick={ctx.link().callback(|_| Msg::AddTimeline)}-->
				<Fa icon={faPlus} size='2x'/>
			</button>
			<!--{ for ctx.props().children.iter() }-->
		</div>
		<div>
			<button title="Settings"> <!-- onclick={ctx.link().callback(|_| Msg::ShowSettings)}-->
				<Fa icon={faCog} size='2x'/>
			</button>
			<a href="https://github.com/misabiko/SoshalThingSvelte" title="Github">
				<button>
					<Fa icon={faGithub} size='2x'/>
				</button>
			</a>
		</div>
	</div>
</nav>