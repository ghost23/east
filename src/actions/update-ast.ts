
import { Action } from 'redux';
export const UPDATE_AST_NODE = "UPDATE_AST_NODE";

export interface UpdateASTNode extends Action {
	type: "UPDATE_AST_NODE";
	nodeType: string;
	uid: string;
	propName: string;
	propIndex?: number;
	newValue: any;
}

export function updateASTNode(newValue: any, type: string, uid: string, propName: string, propIndex?: number): UpdateASTNode {
	return {
		type: UPDATE_AST_NODE,
		nodeType: type,
		uid,
		propName,
		propIndex,
		newValue
	};
}