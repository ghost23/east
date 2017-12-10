
import { Action } from 'redux';
import * as ESTree from 'estree';
export const UPDATE_AST_NODE_PROPERTY = "UPDATE_AST_NODE_PROPERTY";
export const SET_AST_SUBTREE = "SET_AST_SUBTREE";
export const ADD_AST_SUBTREE = "ADD_AST_SUBTREE";
export const REMOVE_AST_SUBTREE = "REMOVE_AST_SUBTREE";

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

export interface SetASTSubtree extends Action {
	type: "SET_AST_SUBTREE";
	insertionPoint: ASTLocation;
	subTree: ESTree.Node
}

export interface AddASTSubtree extends Action {
    type: "ADD_AST_SUBTREE";
    insertionPoint: ASTLocation;
    subTree: ESTree.Node
}

export interface RemoveASTSubtree extends Action {
    type: "REMOVE_AST_SUBTREE";
    insertionPoint: ASTLocation;
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

export function setASTSubtree(insertionPoint: ASTLocation, subTree: ESTree.Node): SetASTSubtree {
	return {
		type: SET_AST_SUBTREE, insertionPoint, subTree
	};
}

export function addASTSubtree(insertionPoint: ASTLocation, subTree: ESTree.Node): AddASTSubtree {
    return {
        type: ADD_AST_SUBTREE, insertionPoint, subTree
    };
}

export function removeASTSubtree(insertionPoint: ASTLocation): RemoveASTSubtree {
    return {
        type: REMOVE_AST_SUBTREE, insertionPoint
    };
}