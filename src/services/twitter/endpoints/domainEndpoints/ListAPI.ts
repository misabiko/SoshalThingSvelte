import type { Instruction } from 'services/twitter/pageAPI';
import APIEndpoint, { type APIParams } from './APIEndpoint';
import type { EndpointConstructorInfo } from 'services/endpoints';

export default class ListAPI extends APIEndpoint<ListLatestTweetsTimelineResponse> {
	readonly name: string;
	readonly endpointPath: string;

	constructor(readonly listId: string) {
		super();

		this.name = 'ListAPI(' + listId + ')';
		this.endpointPath = 'd1mUZHaqFMxe0xHI3rVc-w/ListLatestTweetsTimeline';
	}

	matchParams(params: any): boolean {
		return params.listId === this.listId;
	}

	getInstructions(data: ListLatestTweetsTimelineResponse): Instruction[] {
		return data.data.list.tweets_timeline.timeline.instructions;
	}

	fetchParams(): APIParams {
		const { variables, features } = super.fetchParams();
		return {
			variables: {
				...variables,
				listId: this.listId,
			},
			features,
		};
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TwitterListAPI',
		paramTemplate: [['listId', '']],
		constructor: ({listId}) => new ListAPI(listId as string)
	};
}

type ListLatestTweetsTimelineResponse = {
	data: {
		list: {
			tweets_timeline: {
				timeline: {
					instructions: Instruction[]
					metadata: object
				}
			}
		}
	}
};

// interface ListAPIParams extends APIParams {
// 	variables: {
// 		listId: string
// 	}
// }