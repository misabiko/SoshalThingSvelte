import UserPage from './UserPage.svelte';

console.log('Starting 3000ms timeout...')
setTimeout(() => {
	console.log('Injecting soshalthing...')
	const sections = document.getElementsByTagName('section')
	const target = sections[0]
	if (target === null)
		throw new Error("Couldn't find section")

	new UserPage({
		target,
		anchor: sections[0].children[2]
	})
}, 3000)