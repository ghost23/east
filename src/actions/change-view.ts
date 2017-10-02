import { Action } from 'redux';
import { VIEW_MODES } from '../utils/constants';

export const CHANGE_EDIT_VIEW = "CHANGE_EDIT_VIEW";

export interface ChangeEditView extends Action {
	type: "CHANGE_EDIT_VIEW";
	viewMode: VIEW_MODES;
}

export function changeEditView(viewMode: VIEW_MODES): ChangeEditView {
	return {
		type: CHANGE_EDIT_VIEW,
		viewMode
	};
}