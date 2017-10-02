import { EastStore } from '../reducers/reducers';
import { VIEW_MODES } from '../utils/constants';

export function selectCurrentViewMode(state: EastStore): VIEW_MODES {
	return state.viewMode.currentView;
}