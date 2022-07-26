import UserPage from './UserArtworksPage.svelte';

const path = window.location.pathname.split('/')
if (path.length === 4 || path[4] === 'illustrations' || path[4] === 'artworks') {
	console.log('Starting 3000ms timeout...')
	setTimeout(() => {
		console.log('Injecting soshalthing...')
		const ul = document.querySelector('section > div > div > ul')
		const target = ul?.parentElement?.parentElement?.parentElement
		if (!target)
			throw new Error("Couldn't find section")

		new UserPage({
			target,
			anchor: ul.parentElement.parentElement,
		})
	}, 3000)
}