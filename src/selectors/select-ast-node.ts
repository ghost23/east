import { EastStore } from '../reducers/reducers';
import * as ESTree from 'estree';
import {
	ImportDefaultSpecifier,
	ImportNamespaceSpecifier,
	ImportSpecifier,
	ExportSpecifier,
	ExportDefaultDeclaration,
	ExportAllDeclaration, Identifier, Program
} from 'estree';
import * as path from 'path';
import { specifier } from '../ast-views/textual/components/import-specifier-common/ImportSpecifierCommonView.scss';
import { NodeReference } from '../utils/constants';
import { Declaration } from 'postcss';

export function selectASTNodeByTypeAndId(state: EastStore, type:string, uid:string): ESTree.Node {
	return !nou(type) && !nou(uid) ? state.programModel.astMap[type][uid] : null;
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

export function selectAllFilesList(state: EastStore): string[] {
	return [...state.programModel.importedFiles];
}

export function selectEntryFile(state: EastStore): string {
	return state.programModel.entryFile;
}

export function selectAvailableImportsFromFile(state: EastStore, program:ESTree.Program, visitedFiles: string[] = [], calledViaReExport: boolean = false): Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier> {

	let result: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier> = [];
	const splitProgramPath = program.__east_uid.split('/');
	const programFileName = splitProgramPath[splitProgramPath.length-1].replace('.js', '');

	const exportSpecifiers = selectDescendantsByType(state, program, 'ExportSpecifier') as ExportSpecifier[];
	const hasExportDefault = selectDescendantsByType(state, program, 'ExportDefaultDeclaration').length > 0;
	const exportAllDeclarations = selectDescendantsByType(state, program, 'ExportAllDeclaration') as ExportAllDeclaration[];

	result = exportSpecifiers.map(specifier => {

		const exportedName = (selectASTNodeByTypeAndId(
			state,
			specifier.exported.type,
			(specifier.exported as any).uid) as Identifier
		).name;

		return {
			type: 'ImportSpecifier',
			local: { type: 'Identifier', name: exportedName },
			imported: { type: 'Identifier', name: exportedName }
		} as ImportSpecifier;
	});

	if(hasExportDefault && !calledViaReExport) {
		result = result.concat({ type: 'ImportDefaultSpecifier', local: { type: 'Identifier', name: `${programFileName}Default`}});
	}

	exportAllDeclarations.forEach(declaration => {
		const resolvedDeclaration = selectASTNodeByTypeAndId(state, declaration.source.type, (declaration.source as any).uid) as any;
		const pathOfExportSource = path.join(path.dirname(program.__east_uid), (resolvedDeclaration as Declaration).value + '.js');
		if(visitedFiles.indexOf(pathOfExportSource) < 0) {
			visitedFiles.push(pathOfExportSource);
			result = result.concat(
				selectAvailableImportsFromFile(
					state,
					selectASTNodeByTypeAndId(state, 'Program', pathOfExportSource) as Program,
					visitedFiles,
					true
				)
			);
		}
	});



	return result;
}

function nou(thing: any): boolean {
	return (thing === null || thing === undefined);
}