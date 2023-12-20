import { type Instruction } from 'services/twitter/pageAPI';
import APIEndpoint from './APIEndpoint';
import type { EndpointConstructorInfo } from 'services/endpoints';
import {registerEndpointConstructor} from '../../../service';

export default class TimelineAPI extends APIEndpoint<HomeTimelineResponse> {
	readonly name: string;
	readonly endpointPath: string;

	constructor(readonly timelineType: TimelineType) {
		super();

		switch (timelineType) {
			case TimelineType.ForYou:
				this.name = 'ForYouTimelineAPI';
				this.endpointPath = 'QwrCVrjexN3CAvAAVDU5iw/HomeTimeline';
				break;
			case TimelineType.Following:
				this.name = 'FollowingTimelineAPI';
				this.endpointPath = 'Qe2CCi4SE0Dvsb1TYrDfKQ/HomeLatestTimeline';
				break;
			default:
				throw new Error('Unsupported timeline type');
		}
	}

	matchParams(params: any): boolean {
		if (params.following !== undefined) {
			return params.following === (this.timelineType === TimelineType.Following);
		}else {
			return false
		}
	}

	getInstructions(data: HomeTimelineResponse): Instruction[] {
		return data.data.home.home_timeline_urt.instructions;
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterTimelineAPI',
		paramTemplate: [['following', false]],
		constructor: ({following}) => new TimelineAPI(following ? TimelineType.Following : TimelineType.ForYou)
	};
}

registerEndpointConstructor(TimelineAPI);

export enum TimelineType {
	ForYou,
	Following,
}

type HomeTimelineResponse = {
	data: {
		home: {
			home_timeline_urt: {
				instructions: Instruction[]
				responseObjects: object
				metadata: object
			}
		}
	}
};