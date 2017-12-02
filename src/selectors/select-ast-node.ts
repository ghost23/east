import { EastStore } from '../reducers/reducers';
import * as ESTree from 'estree';

export function selectASTNodeByTypeAndId(state: EastStore, type:string, uid:string): ESTree.Node {
	return state.programModel.astMap[type][uid];
}

export function selectNextParentByType(state: EastStore, node: ESTree.Node, type: string): ESTree.Node | null {
	let currentParent: ESTree.Node = node;
	while(currentParent.__east_parentNode !== null) {
		currentParent = selectASTNodeByTypeAndId(state, currentParent.__east_parentNode.type, currentParent.__east_parentNode.uid);
		if(currentParent.type === type) {
			return currentParent;
		}
	}
	return null;
}

export function selectDescendantsByType(state: EastStore, node: ESTree.Node, type: string): ESTree.Node[] {
	const descendantsByType = node.__east_DescendantNodes.filter(descendant => descendant.type === type);
	return descendantsByType.map(descendant => selectASTNodeByTypeAndId(state, descendant.type, descendant.uid));
}



export function selectEntryFile(state: EastStore): string {
	return state.programModel.entryFile;
}