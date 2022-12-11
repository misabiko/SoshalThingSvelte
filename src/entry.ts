import 'styles/global.sass'

//Add service endpoints here to include them
import './services/twitter/endpoints'
import SoshalThing from "./SoshalThing.svelte"
import {loadMainStorage, loadTimelines} from './storages'
import type {FullscreenInfo} from './timelines'

const {fullscreen: storageFullscreen} = loadMainStorage();
const timelines = loadTimelines();

const searchParams = new URLSearchParams(location.search)
let fullscreen: FullscreenInfo = parseFullscreen(searchParams) ?? storageFullscreen

new SoshalThing({
	target: document.body,
	props: {
		isInjected: false,
		timelines,
		//TODO Move timelineView to loadMainStorage()
		timelineView: {
			//TODO Separate timeline definition from view in storage
			timelineIds: Object.keys(timelines),
			fullscreen,
		}
	}
})



function parseFullscreen(search: URLSearchParams): FullscreenInfo | undefined {
	const param = search.get('fullscreen_timeline')

	switch (param) {
		case null:
		case 'false':
			return undefined
		case '':
		case 'true':
		case '0':
			return {
				index: 0,
				container: null,
				columnCount: null,
			}
	}

	const num = parseInt(param)

	if (isNaN(num))
		return undefined

	return {
		index: num,
		container: null,
		columnCount: null,
	}
}