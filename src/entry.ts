//TODO Replace Field, Modal, Button from svelma

//Add service endpoints here to include them
import './services/twitter/endpoints';
import SoshalThing from './SoshalThing.svelte';
import {loadMainStorage, loadTimelines} from './storages';
import type {FullscreenInfo, TimelineView} from './timelines';

const {timelineIds, fullscreen, timelineViews, defaultTimelineView} = loadMainStorage();
const timelines = loadTimelines();

const searchParams = new URLSearchParams(location.search);

const searchTimelineView = parseTimelineView(timelineViews, searchParams);
const timelineView: TimelineView = searchTimelineView ??
	(defaultTimelineView !== null ? timelineViews[defaultTimelineView]: null) ??
	{
	timelineIds: timelineIds ?? Object.keys(timelines),
	fullscreen,
};
const searchParamsFullscreen = parseFullscreen(searchParams);
if (searchParamsFullscreen !== undefined)
	timelineView.fullscreen = searchParamsFullscreen;

new SoshalThing({
	target: document.body,
	props: {
		isInjected: false,
		timelines,
		timelineView,
		timelineViews,
	}
});



function parseFullscreen(search: URLSearchParams): FullscreenInfo | undefined {
	const param = search.get('fullscreen_timeline');

	switch (param) {
		case null:
		case 'false':
			return undefined;
		case '':
		case 'true':
		case '0':
			return {
				index: 0,
				container: null,
				columnCount: null,
			};
	}

	const num = parseInt(param);

	if (isNaN(num))
		return undefined;

	return {
		index: num,
		container: null,
		columnCount: null,
	};
}

function parseTimelineView(timelineViews: {[name: string]: TimelineView}, search: URLSearchParams): TimelineView | undefined {
	const param = search.get('view');

	if (!param?.length)
		return undefined;
	else if (!Object.hasOwn(timelineViews, param)) {
		console.error(`Couldn't find timeline view "${param}"\nAvailable views: `, timelineViews);
		return undefined;
	}else
		return timelineViews[param];
}