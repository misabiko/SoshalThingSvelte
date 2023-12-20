import './services/twitter/service';
import './services/twitter/endpoints/domainEndpoints/TimelineAPI';
import './services/twitter/endpoints/domainEndpoints/UserTweetsAPI';
import './services/twitter/endpoints/domainEndpoints/ListAPI';

import './services/pixiv/service';
import './services/pixiv/endpoints/bookmarks';
import './services/pixiv/endpoints/follow';
import './services/pixiv/endpoints/user';
import './services/misskey/service';

import './services/misskey/endpoints/timelineEndpoint';



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
if (searchParamsFullscreen !== null)
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

function parseTimelineView(timelineViews: {[name: string]: TimelineView}, search: URLSearchParams): TimelineView | null {
	const param = search.get('view');

	if (!param?.length)
		return null;
	else if (!Object.hasOwn(timelineViews, param)) {
		console.error(`Couldn't find timeline view "${param}"\nAvailable views: `, timelineViews);
		return null;
	}else
		return timelineViews[param];
}