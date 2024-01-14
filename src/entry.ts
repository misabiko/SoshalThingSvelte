import './services/**/service.ts';
import './services/**/*.endpoint.ts';

import {getServices} from './services/service';
console.debug('Loaded services and endpoints:', Object.fromEntries(Object.values(getServices()).map(service => [service.name, Object.keys(service.endpointConstructors)])));

import SoshalThing from './SoshalThing.svelte';
import {loadMainStorage, loadTimelines} from './storages';
import {defaultTimelineView, type FullscreenInfo, type TimelineView} from './timelines';

const {timelineIds, fullscreen, timelineViews, currentTimelineView} = loadMainStorage();
const timelines = loadTimelines();

const searchParams = new URLSearchParams(location.search);

const searchTimelineView = parseTimelineView(timelineViews, searchParams);
const timelineViewId: string = searchTimelineView ?? currentTimelineView ?? defaultTimelineView;
if (timelineViewId === defaultTimelineView) {
	timelineViews[defaultTimelineView] ??= {
		timelineIds: timelineIds ?? Object.keys(timelines),
		fullscreen,
	};
}
const searchParamsFullscreen = parseFullscreen(searchParams);
if (searchParamsFullscreen !== null)
	timelineViews[timelineViewId].fullscreen = searchParamsFullscreen;

new SoshalThing({
	target: document.body,
	props: {
		isInjected: false,
		timelines,
		timelineViewId,
		timelineViews,
	}
});



function parseFullscreen(search: URLSearchParams): FullscreenInfo | null {
	const param = search.get('fullscreen_timeline');

	switch (param) {
		case null:
		case 'false':
			return null;
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
		return null;

	return {
		index: num,
		container: null,
		columnCount: null,
	};
}

function parseTimelineView(timelineViews: {[name: string]: TimelineView}, search: URLSearchParams): string | null {
	const param = search.get('view');

	if (!param?.length)
		return null;
	else if (!Object.hasOwn(timelineViews, param)) {
		console.error(`Couldn't find timeline view "${param}"\nAvailable views: `, timelineViews);
		return null;
	}else
		return param;
}