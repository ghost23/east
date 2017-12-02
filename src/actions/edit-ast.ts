
import { Action } from 'redux';
import * as ESTree from 'estree';
export const UPDATE_AST_NODE_PROPERTY = "UPDATE_AST_NODE_PROPERTY";
export const INSERT_AST_SUBTREE = "INSERT_AST_SUBTREE";

export interface ASTLocation {
	nodeType: string;
	uid: string;
	propName?: string;
	propIndex?: number;
}

export interface UpdateASTNodeProperty extends Action, ASTLocation {
	type: "UPDATE_AST_NODE_PROPERTY";
	newValue: any;
}

export interface InsertASTSubtree extends Action {
	type: "INSERT_AST_SUBTREE";
	insertionPoint: ASTLocation;
	subTree: ESTree.Node
}

export function updateASTNodeProperty(
		newValue: any,
		type: string,
		uid: string,
		propName: keyof ESTree.Node,
		propIndex?: number
): UpdateASTNodeProperty {
	return {
		type: UPDATE_AST_NODE_PROPERTY,
		nodeType: type,
		uid,
		propName,
		propIndex,
		newValue
	};
}

export function insertASTSubtree(insertionPoint: ASTLocation, subTree: ESTree.Node): InsertASTSubtree {
	return {
		type: INSERT_AST_SUBTREE, insertionPoint, subTree
	};
}