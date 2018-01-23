/**
 * Created by mail on 12.12.2016.
 */

import { combineReducers } from 'redux';
import { ProgramModel } from './program-ast';
import { ViewModeState } from './view-modes';
import { programModel } from './program-ast';
import { viewMode } from './view-modes';

export default combineReducers<EastStore>({programModel, viewMode});

export interface EastStore {
	programModel: ProgramModel,
	viewMode: ViewModeState
}