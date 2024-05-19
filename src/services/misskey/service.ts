import type MisskeyArticle from './article';
import type {Service} from '../service';
import {newService, registerService} from '../service';
import type {APIClient} from 'misskey-js/built/api';

export const MisskeyService: MisskeyServiceType = {
	...newService({
		name: 'Misskey',
	}),
	emojis: null, //TODO Fetch from localStorage
};

registerService(MisskeyService);

interface MisskeyServiceType extends Service<MisskeyArticle> {
	cli?: APIClient
	emojis?: Emoji[] | null
}

type Emoji = {
	aliases: string[]
	name: string
	category: null
	url: string
};