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
import { selectAllFilesList, selectASTNodeByTypeAndId } from '../../selectors/select-ast-node';
import { updateASTNodeProperty } from '../../actions/edit-ast';
import ProgramView from './components/program/ProgramView';
import IdentifierView from './components/identifier/IdentifierView';
import StatementView from './components/StatementView';
import ImportDeclarationView from './components/import-declaration/ImportDeclarationView';
import { VariableDeclaration } from 'estree';
import { ClassDeclaration } from 'estree';
import { FunctionDeclaration } from 'estree';

export interface TextualViewProps {
	astNode?: ESTree.Node,
	type: string,
	uid: string,
	onPropChange?: (propName: string, index: number, newValue: any) => void
}

const astSelectorMap: Map<string, Function> = new Map([
	["ImportDeclaration", (state: EastStore) => ({ availableFiles: selectAllFilesList(state) })]
]);

function getASTSelector(props: TextualViewProps): Function {
	return astSelectorMap.has(props.type) ? astSelectorMap.get(props.type) : () => ({});
}

const mapStateToProps = (state: EastStore, ownProps: {uid: string, type:string}) => ({
	astNode: selectASTNodeByTypeAndId(state, ownProps.type, ownProps.uid),
	...getASTSelector(ownProps)(state)
});

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