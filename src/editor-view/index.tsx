/**
 * Created by mail on 07.12.2016.
 */

import * as electron from 'electron';
const ipcRenderer = electron.ipcRenderer;

electron.crashReporter.start({
	productName: "east",
	companyName: "Sven Busse",
	submitURL: 'http://localhost',
	uploadToServer: false
});

import React = require('react');
import ReactDOM = require('react-dom');
import { combineReducers, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import { importJavaScriptFile } from '../actions/ast-import';
import { programModel, viewMode, EastStore} from '../reducers/reducers';

import * as styles from './index.scss';
import EditCanvasController from './edit-canvas';
import { VIEW_MODES } from '../utils/constants';
import { changeEditView } from '../actions/change-view';

declare global { // To make Redux devtools call work
	interface Window { __REDUX_DEVTOOLS_EXTENSION__: Function; }
}

const test = styles.empty;

const eastReducers = combineReducers<EastStore>({programModel, viewMode});
let store: Store<EastStore> = createStore<EastStore>(eastReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
	<Provider store={store}>
		<EditCanvasController/>
	</Provider>,
	document.getElementById('root')
);


ipcRenderer.on('request-file-import', (channel: string, filePath: string) => {
	store.dispatch(importJavaScriptFile(filePath));
});

ipcRenderer.on('change-view-mode', (channel: string, viewMode: VIEW_MODES) => {
	store.dispatch(changeEditView(viewMode));
});

