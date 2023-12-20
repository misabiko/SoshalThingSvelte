import type { ArticleWithRefs } from 'articles';
import WebSocketEndpoint, { type SetupData } from 'services/WebSocketEndpoint';
import { RefreshType } from 'services/endpoints';
import {TwitterService} from '../../service';

export default abstract class WebSocketPageEndpoint extends WebSocketEndpoint {
	constructor(setupData: SetupData) {
		super(new Set<RefreshType>([
			RefreshType.Refresh,
			RefreshType.LoadBottom,
		]), setupData);
	}

	async refresh(refreshType: RefreshType): Promise<ArticleWithRefs[]> {
		console.log('refresh');
		switch (refreshType) {
			case RefreshType.Refresh:
				this.ws.send(JSON.stringify({request: 'refresh'}));
				break;
			case RefreshType.LoadBottom:
				this.ws.send(JSON.stringify({request: 'scrollDown'}));
				break;
		}

		return [];
	}
}