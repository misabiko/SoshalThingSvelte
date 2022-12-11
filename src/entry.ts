import 'styles/global.sass'

//Add service endpoints here to include them
import './services/twitter/endpoints'
import SoshalThing from "./SoshalThing.svelte"
import {loadMainStorage, loadTimelines} from './storages'
import type {FullscreenInfo, TimelineView} from './timelines'

const {timelineIds, fullscreen, timelineViews} = loadMainStorage();
const timelines = loadTimelines();
const timelineView: TimelineView = {
	timelineIds: timelineIds ?? Object.keys(timelines),
	fullscreen,
}

const searchParams = new URLSearchParams(location.search)
const searchParamsFullscreen = parseFullscreen(searchParams)
if (searchParamsFullscreen !== undefined)
	timelineView.fullscreen = searchParamsFullscreen

new SoshalThing({
	target: document.body,
	props: {
		isInjected: false,
		timelines,
		timelineView,
		timelineViews,
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