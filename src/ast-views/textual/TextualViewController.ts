/**
 * Created by mail on 13.12.2016.
 */
/**
 * Created by mail on 01.11.2016.
 */
import * as React from 'react';
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import * as ESTree from 'estree';
import TextualView from './TextualView';
import { EastStore } from '../../reducers/reducers';
import {
	selectAllFilesList, selectASTNodeByTypeAndId,
	selectAvailableImportsFromFile
} from '../../selectors/select-ast-node';
import { updateASTNodeProperty } from '../../actions/edit-ast';
import ProgramView from './components/program/ProgramView';
import IdentifierView from './components/identifier/IdentifierView';
import StatementView from './components/StatementView';
import ImportDeclarationView from './components/import-declaration/ImportDeclarationView';
import ImportSpecifierCommonView from './components/import-specifier-common/ImportSpecifierCommonView';
import { Program, VariableDeclaration } from 'estree';
import { ClassDeclaration } from 'estree';
import { FunctionDeclaration } from 'estree';

export interface TextualViewProps {
	astNode?: ESTree.Node;
	type: string;
	uid: string;
	onPropChange?: (propName: string, index: number, newValue: any) => void;
	[propName: string]: any;
}

const myTest: TextualViewProps = { type: "sdfsd", uid: "sdfds" };

const astSelectorMap = new Map<string, (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.Node) => any>([
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
		}),
		"ImportSpecifier", (state: EastStore, ownProps: TextualViewProps, astNode: ESTree.Node) => ({
			availableImports: selectAvailableImportsFromFile(state, selectASTNodeByTypeAndId(state, 'Program', ownProps.sourceFile as string) as Program)
		})
	]
]);

function getASTSelector(props: TextualViewProps): Function {
	return astSelectorMap.has(props.type) ? astSelectorMap.get(props.type) : () => ({});
}

const mapStateToProps = (state: EastStore, ownProps: {uid: string, type:string}) => {
	const astNode = selectASTNodeByTypeAndId(state, ownProps.type, ownProps.uid);
	return {
		astNode,
		...getASTSelector(ownProps)(state, ownProps, astNode)
	};
};

const mapDispatchToProps = (dispatch: Dispatch<EastStore>, ownProps: {uid: string, type:string}) => ({
	onPropChange: (propName: string, index: number, newValue: any) => {
		dispatch(updateASTNodeProperty(newValue, ownProps.type, ownProps.uid, propName as keyof ESTree.Node, index));
	}
});

const astComponentMap: Map<string, React.ComponentClass<TextualViewProps>> = new Map([
	["Program", ProgramView],
	["Identifier", IdentifierView],
	["ExpressionStatement", StatementView],
	["BlockStatement", StatementView],
	["EmptyStatement", StatementView],
	["DebuggerStatement", StatementView],
	["WithStatement", StatementView],
	["ReturnStatement", StatementView],
	["LabeledStatement", StatementView],
	["BreakStatement", StatementView],
	["ContinueStatement", StatementView],
	["IfStatement", StatementView],
	["SwitchStatement", StatementView],
	["ThrowStatement", StatementView],
	["TryStatement", StatementView],
	["WhileStatement", StatementView],
	["DoWhileStatement", StatementView],
	["ForStatement", StatementView],
	["ForInStatement", StatementView],
	["ForOfStatement", StatementView],
	["FunctionDeclaration", StatementView],
	["VariableDeclaration", StatementView],
	["ClassDeclaration", StatementView],
	["ImportDeclaration", ImportDeclarationView],
	["ImportSpecifier", ImportSpecifierCommonView],
	["ImportDefaultSpecifier", ImportSpecifierCommonView],
	["ImportNamespaceSpecifier", ImportSpecifierCommonView],
]);

function chooseASTComponent(props: TextualViewProps): JSX.Element {
	return React.createElement<TextualViewProps>(
		astComponentMap.has(props.type) ? astComponentMap.get(props.type) : TextualView,
		props
	);
}

const TextualViewController = connect(
	mapStateToProps,
	mapDispatchToProps
)(chooseASTComponent);

export default TextualViewController;