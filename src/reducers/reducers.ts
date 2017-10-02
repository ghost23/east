/**
 * Created by mail on 12.12.2016.
 */

import { ProgramModel } from './program-ast';
import { ViewModeState } from './view-modes';

export { programModel } from './program-ast';
export { viewMode } from './view-modes';

export interface EastStore {
	programModel: ProgramModel,
	viewMode: ViewModeState
}