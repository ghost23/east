import * as ESTree from 'estree';

export enum VIEW_MODES {
	TEXTUAL_VIEW
}

export interface NodeReference {
	type: string;
	uid: string;
}

declare module 'estree' {
	interface BaseNode {
		__east_parentNode?: NodeReference;
		__east_uid?: string;
	}
}