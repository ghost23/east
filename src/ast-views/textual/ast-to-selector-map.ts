import { EastStore } from '../../reducers/reducers';
import * as ESTree from 'estree';
import { Program } from 'estree';
import {
	selectAllFilesList,
	selectASTNodeByTypeAndId,
	selectAvailableImportsFromFile,
	selectNextParentByType
} from '../../selectors/select-ast-node';
import { TextualViewProps } from './TextualViewController';
import * as path from 'path';

export default new Map<string, (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.Node) => any>([
	[
		"ImportDeclaration", (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.Node) => ({
			availableFiles: selectAllFilesList(state),
			sourceFile:
			(selectASTNodeByTypeAndId(
					state,
					(astNode as any).source.type,
					(astNode as any).source.uid
				) as ESTree.Literal
			).value
		})
	],
	[
		"ImportSpecifier", (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.ImportSpecifier) => {

			const availableImports = getPotentialImportsOfFile(state, ownProps, astNode);
			const selectedImportSpecifierName = selectASTNodeByTypeAndId(state, "Identifier", (astNode.imported as any).uid) as ESTree.Identifier;
			const selectedImportSpecifierIndex = availableImports.findIndex(
				importElement =>
					importElement.value.type === astNode.type &&
					importElement.label === selectedImportSpecifierName.name
			);
			return {
				availableImports,
				selectedImport: selectedImportSpecifierIndex
			};
		}
	],
	[
		"ImportDefaultSpecifier", (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.ImportDefaultSpecifier) => {

			const availableImports = getPotentialImportsOfFile(state, ownProps, astNode);
			const selectedImportSpecifierIndex = availableImports.findIndex(
				importElement => importElement.value.type === "ImportSpecifier" && // Because we will only ever show 'default' as a normal ImportSpecifier
					importElement.label === "default"
			);
			return {
				availableImports,
				selectedImport: selectedImportSpecifierIndex
			};
		}
	],
	[
		"ImportNamespaceSpecifier", (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.ImportNamespaceSpecifier) => {

			const availableImports = getPotentialImportsOfFile(state, ownProps, astNode);
			const selectedImportSpecifierIndex = availableImports.findIndex(
				importElement => importElement.value.type === astNode.type
			);
			return {
				availableImports,
				selectedImport: selectedImportSpecifierIndex
			};
		}
	]
]);

function getPotentialImportsOfFile(state: EastStore, ownProps: TextualViewProps, astNode: ESTree.Node):
	{ label: string, value: ESTree.ImportSpecifier | ESTree.ImportNamespaceSpecifier }[] {

	const filePathOfCurrentProgram = selectNextParentByType(state, astNode, "Program").__east_uid;
	const absolutePath: string = path.join(path.dirname(filePathOfCurrentProgram), ownProps.sourceFile as string) + '.js';
	return selectAvailableImportsFromFile(
		state,
		selectASTNodeByTypeAndId(state, 'Program', absolutePath) as Program
	).map(importElement => ({
		label: importElement.type === "ImportSpecifier" ?
			importElement.imported.name :
			'*', // only thing left is ImportNamespaceSpecifier, we don't produce ImportDefaultSpecifier
		value: importElement
	}));
}