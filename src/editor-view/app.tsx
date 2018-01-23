import EditCanvasController from './edit-canvas';
import React = require('react');
import { Provider } from 'react-redux';

export default function(props: { store: any }) {
	return (
		<Provider store={props.store}>
			<EditCanvasController/>
		</Provider>
	);
}
