import type { Instruction } from 'services/twitter/pageAPI';
import APIEndpoint, { type APIParams } from './APIEndpoint';

export default class ListAPI extends APIEndpoint<ListLatestTweetsTimelineResponse> {
	readonly name: string;
	readonly endpointPath: string;

	constructor(readonly listId: string) {
		super();

		this.name = 'ListAPI(' + listId + ')';
		this.endpointPath = 'd1mUZHaqFMxe0xHI3rVc-w/ListLatestTweetsTimeline';
	}

	matchParams(_params: any): boolean {
		throw new Error('Method not implemented.');
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