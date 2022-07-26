import UserPage from './UserArtworksPage.svelte';

const path = window.location.pathname.split('/')
if (path.length === 4 || path[4] === 'illustrations' || path[4] === 'artworks') {
	let attempts = 0
	let ul = null
	const intervalId = setInterval(() => {
		console.log('Check if we can inject...')
		ul = document.querySelector('section > div > div > ul')
		if (ul?.children.length) {
			clearInterval(intervalId)
			console.log('Injecting soshalthing...')
			const target = ul?.parentElement?.parentElement?.parentElement
			if (!target)
				throw new Error("Couldn't find section")

			new UserPage({
				target,
				anchor: ul?.parentElement?.parentElement as HTMLElement,
			})
		}else
			++attempts

		if (attempts >= 10) {
			clearInterval(intervalId)
			console.warn("Couldn't inject after 10 attemps")
		}
	}, 500)
}