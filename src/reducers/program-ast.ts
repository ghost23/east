/**
 * Created by mail on 12.12.2016.
 */

import { IMPORT_JAVASCRIPT_FILE, ImportJavaScriptfileAction } from '../actions/ast-import';
import { UPDATE_AST_NODE, UpdateASTNode } from '../actions/update-ast';
import { Action } from 'redux';
import { importJavaScript } from '../main/importer/import-javascript';
import * as ESTree from 'estree';
import { clone } from 'lodash';

export interface ProgramModel {
	astMap: { [key:string]: { [key:string]: ESTree.Node } },
	importedFiles: string[],
	entryFile: string,
	importError: Error
}

const DEFAULT_AST: { [key:string]: { [key:string]: ESTree.Node } } = {};
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
		case UPDATE_AST_NODE: {
			const typeAction = action as UpdateASTNode;
			const newASTMap = clone(state.astMap);
			const newASTSubMap = clone(newASTMap[typeAction.nodeType]);
			const newNode = clone(newASTSubMap[typeAction.uid]);
			if(typeAction.propIndex !== null && typeAction.propIndex !== undefined) {
				(newNode as any)[typeAction.propName][typeAction.propIndex] = typeAction.newValue;
			} else {
				(newNode as any)[typeAction.propName] = typeAction.newValue;
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