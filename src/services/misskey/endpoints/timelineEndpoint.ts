import type {EndpointConstructorInfo} from '../../endpoints';
import {Endpoint, RefreshType} from '../../endpoints';
import type {ArticleWithRefs} from '../../../articles';
import * as Misskey from 'misskey-js';
import {misskey} from '../../../../credentials.json';
import {fromAPI} from '../article';
import {getHiddenStorage, getMarkedAsReadStorage} from '../../../storages/serviceCache';
import {MisskeyService} from '../service';

export class TimelineEndpoint extends Endpoint {
	readonly name = 'Timeline Endpoint';
	readonly service = 'Misskey';
	readonly cli;

	constructor() {
		super(new Set([RefreshType.Refresh]));

		this.cli = new Misskey.api.APIClient({
			origin: misskey.origin,
			credential: misskey.access,
		});
	}


	matchParams(_params: any): boolean {
		return true;
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		const limit = refreshType === RefreshType.RefreshStart ? undefined : 50;
		const notes = await this.cli.request('notes/timeline', {
			limit,
		});

		const markedAsReadStorage = getMarkedAsReadStorage(MisskeyService);
		const hiddenStorage = getHiddenStorage(MisskeyService);

		console.log(notes);
		return notes.map(n => fromAPI(n, markedAsReadStorage, hiddenStorage));
	}

	static readonly constructorInfo: EndpointConstructorInfo = {
		name: 'TimelineEndpoint',
		paramTemplate: [],
		constructor: () => new TimelineEndpoint()
	};
}