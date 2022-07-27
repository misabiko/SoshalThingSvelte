import UserPage from './UserArtworksPage.svelte';
import {tryInject} from '../index'

const path = window.location.pathname.split('/')
if (path.length === 4 || path[4] === 'illustrations' || path[4] === 'artworks') {
	tryInject(() => {
		const element = document.querySelector('section > div > div > ul')
		if (element?.children.length)
			return element
		else
			return null
	})
	.then(element => {
		const anchor = element.parentElement?.parentElement
		const target = anchor?.parentElement
		if (!target)
			throw new Error("Couldn't find ul")

		new UserPage({target, anchor})
	})
}