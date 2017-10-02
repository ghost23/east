import { Action } from 'redux';
import { CHANGE_EDIT_VIEW, ChangeEditView} from '../actions/change-view';
import { VIEW_MODES } from '../utils/constants';

export interface ViewModeState {
	currentView: VIEW_MODES
}

const DEFAULT_VIEWMODE_STATE: ViewModeState = {
	currentView: VIEW_MODES.TEXTUAL_VIEW
};

export function viewMode(state: ViewModeState = DEFAULT_VIEWMODE_STATE, action: Action): ViewModeState {
	switch(action.type) {
		case CHANGE_EDIT_VIEW: {
			return {
				currentView: (action as ChangeEditView).viewMode
			};
		}
		default: {
			return state;
		}
	}
}