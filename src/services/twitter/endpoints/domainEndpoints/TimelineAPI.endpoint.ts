import { type Instruction } from '~/services/twitter/pageAPI';
import APIEndpoint from './APIEndpoint';
import type { EndpointConstructorInfo } from '~/services/endpoints';
import {registerEndpointConstructor} from '~/services/service';
import {TwitterService} from '../../service';

export default class TimelineAPI extends APIEndpoint<HomeTimelineResponse> {
	static service = TwitterService.name;
	readonly name: string;
	readonly params;

	constructor(readonly timelineType: TimelineType) {
		super(queryName[timelineType]);

		switch (timelineType) {
			case TimelineType.ForYou:
				this.name = 'ForYouTimelineAPI';
				break;
			case TimelineType.Following:
				this.name = 'FollowingTimelineAPI';
				break;
			default:
				throw new Error('Unsupported timeline type');
		}

		this.params = {
			following: timelineType === TimelineType.Following,
		};
	}

	matchParams(params: any): boolean {
		if (params.following !== undefined) {
			return params.following === (this.timelineType === TimelineType.Following);
		}else {
			return false;
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
const queryName = {
	[TimelineType.ForYou]: 'HomeTimeline',
	[TimelineType.Following]: 'HomeLatestTimeline',
};

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