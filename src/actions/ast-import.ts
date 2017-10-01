/**
 * Created by mail on 12.12.2016.
 */

import { Action } from 'redux';
export const IMPORT_JAVASCRIPT_FILE = "IMPORT_JAVASCRIPT_FILE";

export interface ImportJavaScriptfileAction extends Action {
	type: "IMPORT_JAVASCRIPT_FILE";
	filePath: string;
}

export function importJavaScriptFile(filePath: string): ImportJavaScriptfileAction {
	return { type: IMPORT_JAVASCRIPT_FILE, filePath };
}