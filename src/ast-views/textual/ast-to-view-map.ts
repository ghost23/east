import ProgramView from './components/program/ProgramView';
import IdentifierView from './components/identifier/IdentifierView';
import StatementView from './components/StatementView';
import ImportDeclarationView from './components/import-declaration/ImportDeclarationView';
import ImportSpecifierCommonView from './components/import-specifier-common/ImportSpecifierCommonView';
import { TextualViewProps } from './TextualViewController';

export default new Map<string, React.ComponentClass<TextualViewProps>>([
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