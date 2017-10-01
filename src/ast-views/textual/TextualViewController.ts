/**
 * Created by mail on 13.12.2016.
 */
/**
 * Created by mail on 01.11.2016.
 */
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import TextualView from './TextualView';
import { EastStore } from '../../reducers/reducers';
import { selectASTNodeByTypeAndId } from '../../selectors/selectASTNode';
import { updateASTNode } from '../../actions/update-ast';

const mapStateToProps = (state: EastStore, ownProps: {uid: string, type:string}) => ({
	astNode: selectASTNodeByTypeAndId(state, ownProps.type, ownProps.uid),
});

const mapDispatchToProps = (dispatch: Dispatch<EastStore>, ownProps: {uid: string, type:string}) => ({
	onPropChange: (propName: string, index: number, newValue: any) => {
		//console.log("changing", propName, "with index", index, "to", newValue);
		dispatch(updateASTNode(newValue, ownProps.type, ownProps.uid, propName, index));
	}
});

const TextualViewController = connect(
	mapStateToProps,
	mapDispatchToProps
)(TextualView); //TODO: Build a HOC, that picks the right view component depending on node type

export default TextualViewController;