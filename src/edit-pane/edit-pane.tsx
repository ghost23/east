/**
 * Created by mail on 07.12.2016.
 */

import * as electron from 'electron';
const ipcRenderer = electron.ipcRenderer;

import React = require('react');
import ReactDOM = require('react-dom');
import { combineReducers, createStore, Store } from 'redux';
import { Provider } from 'react-redux';
import { importJavaScriptFile } from '../actions/ast-import';
import { programModel, EastStore} from '../reducers/reducers';
import TextualViewController from '../ast-views/textual/TextualViewController';

import * as styles from './edit-pane.scss';

declare global { // To make Redux devtools call work
	interface Window { __REDUX_DEVTOOLS_EXTENSION__: Function; }
}

const test = styles.empty;

const eastReducers = combineReducers<EastStore>({programModel});
let store: Store<EastStore> = createStore<EastStore>(eastReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
	<Provider store={store}>
		<TextualViewController type="Program" uid="1" />
	</Provider>,
	document.getElementById('root')
);


ipcRenderer.on('request-file-import', (channel: string, filePath: string) => {
	console.log("file to be imported:", filePath);
	store.dispatch(importJavaScriptFile(filePath));
});

