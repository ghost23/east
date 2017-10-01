/**
 * Created by mail on 12.12.2016.
 */

import * as ESTree from 'estree';
import { ProgramModel } from './program-ast';

export { programModel } from './program-ast';

export interface EastStore {
	programModel: ProgramModel
}