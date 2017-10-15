/**
 * Created by mail on 13.12.2016.
 */
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import { EastStore } from '../reducers/reducers';
import { selectCurrentViewMode } from '../selectors/select-view-mode';
import { changeEditView} from '../actions/change-view';
import * as React from 'react';
import TextualViewController from '../ast-views/textual/TextualViewController';
import { ASTViewProps } from '../ast-views/ast-view';
import { VIEW_MODES } from '../utils/constants';
import { selectEntryFile } from '../selectors/select-ast-node';

const mapStateToProps = (state: EastStore) => ({
	viewMode: selectCurrentViewMode(state),
	entryFile: selectEntryFile(state)
});

const mapDispatchToProps = (dispatch: Dispatch<EastStore>) => ({
	onViewModeChange: (viewMode: VIEW_MODES) => {
		dispatch(changeEditView(viewMode));
	}
});

interface EmptyState {}

interface EditCanvasProps {
	viewMode: VIEW_MODES,
	entryFile: string,
	onViewModeChange: (viewMode: VIEW_MODES) => void
}

class EditCanvas extends React.Component<EditCanvasProps, EmptyState> {

	static viewModeMap: Map<VIEW_MODES, React.ComponentClass<ASTViewProps>> = new Map([
		[VIEW_MODES.TEXTUAL_VIEW, TextualViewController]
	]);

	public render(): JSX.Element {
		return React.createElement<ASTViewProps>(
			EditCanvas.viewModeMap.get(this.props.viewMode),
			{ type: "Program", uid: this.props.entryFile }
		);
	}
}

const EditCanvasController = connect(
	mapStateToProps,
	mapDispatchToProps
)(EditCanvas);

export default EditCanvasController;