/**
 * Created by mail on 13.12.2016.
 */
import * as React from 'react';
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import * as ESTree from 'estree';
import TextualView from './TextualView';
import { EastStore } from '../../reducers/reducers';
import { selectASTNodeByTypeAndId } from '../../selectors/select-ast-node';
import { updateASTNodeProperty, setASTSubtree } from '../../actions/edit-ast';
import astComponentMap from './ast-to-view-map';
import astSelectorMap from './ast-to-selector-map';

export interface TextualViewProps {
	astNode?: ESTree.Node;
	type: string;
	uid: string;
	onPropChange?: (propName: string, index: number, newValue: any) => void;
	onNodePropChange?: (propName: string, index: number, newValue: any) => void;
	[propName: string]: any;
}

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
	},
	onNodePropChange: (propName: string, index: number, newValue: ESTree.Node) => {
		dispatch(setASTSubtree({nodeType: ownProps.type, uid: ownProps.uid, propName, propIndex: index}, newValue));
	}
});

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