import MisskeyArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import {TimelineEndpoint} from './endpoints/timelineEndpoint';
import {emojis} from './emojis.json';
import type {APIClient} from 'misskey-js/built/api';

export const MisskeyService: MisskeyServiceType = {
	...newService('Misskey'),
	endpointConstructors: [
		TimelineEndpoint.constructorInfo
	],
	emojis,
};
MisskeyArticle.service = MisskeyService.name;

registerService(MisskeyService);

interface MisskeyServiceType extends Service<MisskeyArticle> {
	cli?: APIClient;
	emojis?: Emoji[]
}

type Emoji = {
	aliases: string[],
	name: string
	category: null,
	url: string
};