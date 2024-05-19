import type { Instruction } from '~/services/twitter/pageAPI';
import APIEndpoint, { type APIParams } from './APIEndpoint';
import type { EndpointConstructorInfo } from '~/services/endpoints';
import {registerEndpointConstructor} from '~/services/service';
import {TwitterService} from '../../service';

export default class LikesAPI extends APIEndpoint<LikesResponse> {
	static service = TwitterService.name;
	readonly name: string;
	readonly endpointPath: string;
	readonly params;

	constructor(readonly userId: string) {
		super();

		this.name = 'LikesAPI(' + userId + ')';
		this.endpointPath = 'cBm2Rtb426W3LIWEE_FM6w/Likes';

		this.params = {
			userId,
		};
	}

	matchParams(params: any): boolean {
		return params.userId === this.userId;
	}

	getInstructions(data: LikesResponse): Instruction[] {
		return data.data.user.result.timeline_v2.timeline.instructions;
	}

	fetchParams(): APIParams {
		const { variables, features } = super.fetchParams();
		return {
			variables: {
				...variables,
				userId: this.userId,
				withV2Timeline: true,
			},
			features: {
				...features,
				rweb_video_timestamps_enabled: false,
			},
		};
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterLikesAPI',
		paramTemplate: [['userId', '']],
		constructor: ({userId}) => new LikesAPI(userId as string)
	};
}

registerEndpointConstructor(LikesAPI);

type LikesResponse = {
	data: {
		user: {
			result: {
				__typename: 'User'
				timeline_v2: {
					timeline: {
						instructions: Instruction[]
						metadata: object
					}
				}
			}
		}
	}
};

// interface LikesAPIParams extends APIParams {
// 	variables: {
// 		userId: string,
// 		includePromotedContent: false,
// 		withClientEventToken: false,
// 		withBirdwatchNotes: false,
// 		withVoice: true,
// 		withV2Timeline: true
// 	};
// }