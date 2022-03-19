<script>
	import TimelineContainer from "../components/TimelineContainer.svelte";
	import Sidebar from "../components/sidebar/Sidebar.svelte";

	//chrome.runtime.sendMessage("ialpimkfmdjoekolcmhnajfkmhchkmbd", "message to extension", response => console.dir(response));
</script>

<style lang="sass" global>
	@import "../../node_modules/bulma/bulma.sass"

	html
		overflow-y: hidden
		//height: -webkit-fill-available*/

	//TODO Fix 100% height on mobile, maybe using -webkit-fill-available
	body
		margin: 0
		height: 100vh
		//height: -webkit-fill-available
		-webkit-font-smoothing: antialiased
		-moz-osx-font-smoothing: grayscale
		display: flex

	::-webkit-scrollbar
		width: 12px
		height: 12px

	::-webkit-scrollbar-thumb
		border-radius: 0
		background-color: $scheme-main-ter

	.input.is-static
		color: $text

	.svelte-fa
		color: $white-ter

	.svelte-fa.darkIcon
		color: $black-ter

	.dropdown-trigger .svelte-fa
		color: $button-color

	.favviewer
		@import "../../node_modules/bulma/bulma.sass"

		height: 100%
		display: flex

	#soshal-notifications
		position: absolute
		right: 0
		bottom: 0
		padding: 15px
		z-index: 1

	img.emoji
		height: 1em
		width: 1em
		margin: 0 .05em 0 .1em
		vertical-align: -0.1em

	//#favviewer
	//	width: 100vw
	//	height: 90vh
	//	display: flex
	//	-webkit-font-smoothing: antialiased
	//	-moz-osx-font-smoothing: grayscale
</style>

<Sidebar/>
<TimelineContainer/>