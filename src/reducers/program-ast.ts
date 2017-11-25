/**
 * Created by mail on 12.12.2016.
 */

import { IMPORT_JAVASCRIPT_FILE, ImportJavaScriptfileAction } from '../actions/ast-import';
import { UPDATE_AST_NODE_PROPERTY, UpdateASTNodeProperty } from '../actions/edit-ast';
import { Action } from 'redux';
import { importJavaScript } from '../main/importer/import-javascript';
import * as ESTree from 'estree';
import { clone } from 'lodash';
const uid = require('uid');
import { isNode, isReferenceNode } from '../utils/estree-walker';
import { NodeReference } from '../utils/constants';



export type ASTMap = {
	[nodeType:string]: { [uid:string]: ESTree.Node }
};

export interface ProgramModel {
	astMap: ASTMap,
	importedFiles: string[],
	entryFile: string,
	importError: Error
}

const DEFAULT_AST: ASTMap = {};
DEFAULT_AST["Program"] = {};
DEFAULT_AST["Program"]["/"] = {
	body: [],
	sourceType: "module",
	type: "Program",
	loc: null
};

const DEFAULT_PROGRAM_MODEL: ProgramModel = {
	astMap: DEFAULT_AST,
	importedFiles: [],
	entryFile: "/",
	importError: null
};

function modifyParentsDescendantsLists(modifier: (uidList: NodeReference[]) => NodeReference[], node: ESTree.Node, astMap: ASTMap): void {
	let parent:ESTree.Node = node;
	while(parent !== null && parent !== undefined) {
		parent.__east_DescendantNodes = modifier(parent.__east_DescendantNodes);
		const nextParentNodeRef = parent.__east_parentNode;
		parent = astMap[nextParentNodeRef.type][nextParentNodeRef.uid] as ESTree.Node;
	}
}

export function programModel(state: ProgramModel = DEFAULT_PROGRAM_MODEL, action: Action): ProgramModel {
	switch (action.type) {
		case IMPORT_JAVASCRIPT_FILE: {
			let programModel: ProgramModel;
			try {
				let astMap = importJavaScript((action as ImportJavaScriptfileAction).filePath);
				programModel = {
					astMap,
					importedFiles: state.importedFiles.concat((action as ImportJavaScriptfileAction).filePath),
					entryFile: (action as ImportJavaScriptfileAction).filePath,
					importError: null
				};
			} catch(e) {
				programModel = {
					astMap: state.astMap,
					importedFiles: state.importedFiles,
					entryFile: state.entryFile,
					importError: { name: e.name, message: e.message, stack: e.stack }
				};
			}
			return programModel;
		}
		case UPDATE_AST_NODE_PROPERTY: {
			const typeAction = action as UpdateASTNodeProperty;
			const newASTMap = clone(state.astMap);
			const newASTSubMap = clone(newASTMap[typeAction.nodeType]);
			const newNode = clone(newASTSubMap[typeAction.uid]);
			const hasPropIndex = typeAction.propIndex !== null && typeAction.propIndex !== undefined;

			if(isNode(typeAction.newValue)) {
				const newUid = uid(10);
				const newPropNode = typeAction.newValue as ESTree.Node;
				newPropNode.__east_uid = newUid;
				newPropNode.__east_DescendantNodes = [];
				newPropNode.__east_parentNode = { type: typeAction.nodeType, uid: typeAction.uid };
				const newProbNodeRef: NodeReference = { type: newPropNode.type, uid: newUid };
				const currentProbNodeRef = hasPropIndex ?
					((newNode as any)[typeAction.propName] as Array<any>)[typeAction.propIndex] as NodeReference :
					(newNode as any)[typeAction.propName] as NodeReference;
				if(isReferenceNode(currentProbNodeRef)) {
					const currentProbNode = newASTMap[currentProbNodeRef.type][currentProbNodeRef.uid] as ESTree.Node;
					currentProbNode.__east_parentNode = null;
					modifyParentsDescendantsLists(descendants => descendants.filter(
						nodeReference => nodeReference.type !== currentProbNode.type && nodeReference.uid !== currentProbNode.__east_uid
					), newNode, newASTMap);
				}
				if(hasPropIndex) {
					((newNode as any)[typeAction.propName] as Array<any>)[typeAction.propIndex] = newProbNodeRef;
				} else {
					(newNode as any)[typeAction.propName] = newProbNodeRef;
				}
				modifyParentsDescendantsLists(descendants => {
					descendants.push(newProbNodeRef);
					return descendants;
				}, newNode, newASTMap);
			} else {
				if(hasPropIndex) {
					((newNode as any)[typeAction.propName] as Array<any>)[typeAction.propIndex] = typeAction.newValue;
				} else {
					(newNode as any)[typeAction.propName] = typeAction.newValue;
				}
			}

			newASTMap[typeAction.nodeType] = newASTSubMap;
			newASTSubMap[typeAction.uid] = newNode;

			return {
				astMap: newASTMap,
				importedFiles: state.importedFiles,
				entryFile: state.entryFile,
				importError: state.importError
			}
		}
		default: {
			return state;
		}
	}
}