import MisskeyArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import {TimelineEndpoint} from './endpoints/timelineEndpoint';
import type {APIClient} from 'misskey-js/built/api';

export const MisskeyService: MisskeyServiceType = {
	...newService('Misskey'),
	endpointConstructors: [
		TimelineEndpoint.constructorInfo
	],
	emojis: null, //TODO Fetch from localStorage
};
MisskeyArticle.service = MisskeyService.name;

registerService(MisskeyService);

interface MisskeyServiceType extends Service<MisskeyArticle> {
	cli?: APIClient;
	emojis?: Emoji[] | null;
}

type Emoji = {
	aliases: string[],
	name: string
	category: null,
	url: string
};