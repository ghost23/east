/**
 * Created by Sven Busse on 15.12.2016.
 * This is a typescript port of
 * https://github.com/Rich-Harris/estree-walker
 *
 * the childKeys cache is deactivated
 */

import * as ESTree from 'estree';
import { isArray, isObject } from 'lodash';

export interface Visitor {
	(mappedNode: any | null, node: ESTree.Node, mappedParent: any | null, parent: ESTree.Node, propertyName: string, index?: number): any | void;
}

export function walk(ast: ESTree.Node, enter?: Visitor, leave?: Visitor): any | void {
	return visit(ast, null, null, enter, leave);
}

const context = {
	skip: () => context.shouldSkip = true,
	shouldSkip: false
};

export function isNode(value: any): boolean {
	return isObject(value) && 'type' in value && !('uid' in value);
}

export function isReferenceNode(value: any): boolean {
	return isObject(value) && 'type' in value && 'uid' in value;
}

function visit(
		node: ESTree.Node,
		parent: ESTree.Node | null,
		mappedParent: any | null,
		enter?: Visitor,
		leave?: Visitor,
		prop?: string,
		index?: number): any | void {

	if (!node) return;

	let visitorStackData: any = null;

	if(enter) {
		context.shouldSkip = false;
		visitorStackData = enter.call(context, null, node, mappedParent, parent, prop, index);
		if(context.shouldSkip) return;
	}

	Object.keys(node).forEach(
		(key: keyof ESTree.Node) => {

			if(key.startsWith('__east_')) return; // No parsing of our own internal properties

			const value: any = node[key];

			if(isArray(value)) {
				for(let j = 0; j < value.length; j++) {
					if(isNode(value[j])) {
						visit(value[j] as ESTree.Node, node, visitorStackData, enter, leave, key, j);
					}
				}
			}

			else if(isNode(value)) {
				visit(value, node, visitorStackData, enter, leave, key, null);
			}
		}
	);

	if(leave) {
		leave(visitorStackData, node, mappedParent, parent, prop, index);
	}

	return visitorStackData;
}