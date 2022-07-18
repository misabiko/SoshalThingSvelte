import 'styles/global.sass'

//Add service endpoints here to include them
import './services/twitter/endpoints'
//TODO Conditionally include dummy service in tests
import './services/dummy/endpoints'
import SoshalThing from "./SoshalThing.svelte"
import {loadMainStorage, loadTimelines} from './storages'

const {fullscreen: storageFullscreen} = loadMainStorage();
const initTimelines = loadTimelines();

const searchParams = new URLSearchParams(location.search)
let fullscreen: number | undefined = parseFullscreen(searchParams) ?? storageFullscreen

new SoshalThing({
	target: document.body,
	props: {
		isInjected: false,
		initTimelines,
		fullscreen,
	}
})



function parseFullscreen(search: URLSearchParams): number | undefined {
	const param = search.get('fullscreen_timeline')

	switch (param) {
		case null:
		case 'false':
			return undefined
		case '':
		case 'true':
		case '0':
			return 0
	}

	const num = parseInt(param)

	if (isNaN(num))
		return undefined

	return num
}