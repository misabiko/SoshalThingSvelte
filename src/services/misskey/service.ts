import type MisskeyArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import type {api as Misskey} from 'misskey-js';

export const MisskeyService: MisskeyServiceType = {
	...newService({
		name: 'Misskey',
	}),
	emojis: null, //TODO Fetch from localStorage
};

registerService(MisskeyService);

interface MisskeyServiceType extends Service<MisskeyArticle> {
	cli?: Misskey.APIClient
	emojis?: Emoji[] | null
}

type Emoji = {
	aliases: string[]
	name: string
	category: null
	url: string
};