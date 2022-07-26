import PixivArticle from './article'
import type {Service} from '../service'
import {registerService} from '../service'

export const PixivService: Service<PixivArticle> = {
	name: 'Pixiv',
	articles: {},
	endpointConstructors: [],
	userEndpoint: undefined,
	articleActions: {},
}
PixivArticle.service = PixivService.name

registerService(PixivService)