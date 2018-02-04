/**
 * Created by mail on 07.12.2016.
 */

import * as electron from 'electron';

electron.crashReporter.start({
	productName: "east",
	companyName: "Sven Busse",
	submitURL: 'http://localhost',
	uploadToServer: false
});

import React = require('react');
import ReactDOM = require('react-dom');

import * as styles from './index.scss';
import App from './app';
import { createStore, Store } from 'redux';
import { EastStore } from '../reducers/reducers';
import combinedReducers from '../reducers/reducers';
import { changeEditView } from '../actions/change-view';
import { VIEW_MODES } from '../utils/constants';
import { importJavaScriptFile } from '../actions/ast-import';
const ipcRenderer = electron.ipcRenderer;

declare global { // To make Redux devtools call work
	interface Window { __REDUX_DEVTOOLS_EXTENSION__: Function; }
}

const test = styles.empty;

let store: Store<EastStore> = createStore<EastStore>(combinedReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

if ((module as any).hot) {
	(module as any).hot.accept('../reducers/reducers', () =>
		store.replaceReducer(require('../reducers/reducers').default)
	);
}

const render = () => {
	const NextApp = require('./app').default;
	ReactDOM.render(
		<NextApp store={store} />,
		document.getElementById('root')
	);
};

render();

if((module as any).hot) {
	(module as any).hot.accept('./app', render);
}

ipcRenderer.on('request-file-import', (channel: string, filePath: string) => {
	store.dispatch(importJavaScriptFile(filePath));
});

ipcRenderer.on('change-view-mode', (channel: string, viewMode: VIEW_MODES) => {
	store.dispatch(changeEditView(viewMode));
});
