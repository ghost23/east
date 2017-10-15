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
import { selectASTNodeByTypeAndId } from '../../selectors/select-ast-node';
import { updateASTNode } from '../../actions/update-ast';
import IdentifierView from './components/IdentifierView';

export interface TextualViewProps {
	astNode: ESTree.Node,
	type: string,
	uid: string,
	onPropChange: (propName: string, index: number, newValue: any) => void
}

const mapStateToProps = (state: EastStore, ownProps: {uid: string, type:string}) => ({
	astNode: selectASTNodeByTypeAndId(state, ownProps.type, ownProps.uid)
});

const mapDispatchToProps = (dispatch: Dispatch<EastStore>, ownProps: {uid: string, type:string}) => ({
	onPropChange: (propName: string, index: number, newValue: any) => {
		dispatch(updateASTNode(newValue, ownProps.type, ownProps.uid, propName, index));
	}
});

const astComponentMap: Map<string, React.ComponentClass<TextualViewProps>> = new Map([
	["Program", TextualView],
	["Identifier", IdentifierView]
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