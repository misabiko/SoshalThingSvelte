import type {TimelineData} from './components/Timeline.svelte'

export const TIMELINE_STORAGE_KEY = 'SoshalThingSvelte Timelines';

export async function loadTimelines(): Promise<TimelineData[]> {
	return []
}