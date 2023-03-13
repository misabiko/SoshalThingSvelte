import MisskeyArticle from "./article";
import type {Service} from "../service";
import {newService, registerService} from "../service";
import {TimelineEndpoint} from "./endpoints/timelineEndpoint";

export const MisskeyService: Service<MisskeyArticle> = {
	...newService('Misskey'),
	endpointConstructors: [
		TimelineEndpoint.constructorInfo
	]
};
MisskeyArticle.service = MisskeyService.name;

registerService(MisskeyService)