import { EastStore } from '../reducers/reducers';
import * as ESTree from 'estree';

export function selectASTNodeByTypeAndId(state: EastStore, type:string, uid:string): ESTree.Node {
	return state.programModel.astMap[type][uid];
}