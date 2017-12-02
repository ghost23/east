/**
 * Created by mail on 08.12.2016.
 */
import * as path from 'path';
import { parseModule, parseScript } from 'esprima';
import * as ESTree from 'estree';
import { readFileSync } from 'fs';
import { walk, Visitor } from '../../utils/estree-walker';
import { clone } from 'lodash';
import { NodeReference } from '../../utils/constants';
const uid = require('uid');

const testForJavaScriptEnding = /\.js$/;

interface ParseError {
	name: string;
	message: string;
	index: number;
	lineNumber: number;
	column: number;
	description: string;
}

function loadFile(filePath: string): string {

	if(filePath.match(testForJavaScriptEnding) !== null) {
		return readFileSync(filePath, "utf8");
	}
}

function parseJavaScriptFile(fileContent: string, module: boolean = true): ESTree.Program {

	return module ? parseModule(fileContent) : parseScript(fileContent);
}

export function createSyntaxMapsFromTree(ast: ESTree.Node, filePath: string, priorSyntaxMap?: { [key:string]: { [key:string]: ESTree.Node } }): { [key:string]: { [key:string]: ESTree.Node } } {

	const syntaxMap: { [key:string]: { [key:string]: ESTree.Node } } = priorSyntaxMap || {};

	walk(ast, (
		mappedNode: ESTree.Node | null,
		node: ESTree.Node,
		mappedParent: ESTree.Node | null,
		parent: ESTree.Node,
		propertyName: keyof ESTree.Node,
		index: number | string
	) => {

		const nodeType: string = node.type;
		if(!syntaxMap[nodeType]) syntaxMap[nodeType] = {};
		const typeMap = syntaxMap[nodeType];

		const newNode:ESTree.Node = clone(node);
		newNode.__east_DescendantNodes = [];

		if(mappedParent) {
			newNode.__east_parentNode = { type: mappedParent.type, uid: mappedParent.__east_uid };
		} else {
			newNode.__east_parentNode = null;
		}

		const newUId = nodeType === "Program" ? filePath : uid(10);
		newNode.__east_uid = newNode.__east_uid || newUId;
		typeMap[newUId] = newNode;
		if(mappedParent) {
			if(index !== null && index !== undefined) {
				if(Array.isArray(mappedParent[propertyName]) && typeof index === "number") {
					(mappedParent[propertyName] as Array<any>)[index] = {type: newNode.type, uid: newUId};
				} else {
					(mappedParent[propertyName] as {[index:string]:any})[index] = {type: newNode.type, uid: newUId};
				}
			} else {
				mappedParent[propertyName] = {type: newNode.type, uid: newUId};
			}
		}
		return newNode;
	}, (
		mappedNode: ESTree.Node | null,
		node: ESTree.Node,
		mappedParent: ESTree.Node | null,
		parent: ESTree.Node,
		propertyName: keyof ESTree.Node,
		index: number
	) => {

		if(mappedParent) {
			const referenceList: Array<NodeReference> =
				mappedNode.__east_DescendantNodes.concat({type: node.type, uid: mappedNode.__east_uid});

			mappedParent.__east_DescendantNodes = mappedParent.__east_DescendantNodes.concat(referenceList);
		}
	});

	return syntaxMap;
}

export function importJavaScript(entryFile: string): { [key:string]: { [key:string]: ESTree.Node } } {

	const listOfFilesToBeParsed: Array<string> = [];
	listOfFilesToBeParsed.push(entryFile);

	const setOfFilesAlreadyParsed: Set<string> = new Set();

	let file: string;
	let filePath: string;
	let ast: ESTree.Program;
	let syntaxMap: { [key:string]: { [key:string]: ESTree.Node } };

	while(listOfFilesToBeParsed.length > 0) {

		file = listOfFilesToBeParsed.pop();
		setOfFilesAlreadyParsed.add(file);
		console.log('now examining:', file);
		filePath = path.dirname(file);
		ast = parseJavaScriptFile(loadFile(file), true);
		syntaxMap = createSyntaxMapsFromTree(ast, file, syntaxMap);

		const importDeclarations: { [key:string]: ESTree.ImportDeclaration } = syntaxMap['ImportDeclaration'] as { [key:string]: ESTree.ImportDeclaration };
		if(importDeclarations) {
			Object.keys(importDeclarations).forEach((id: string) => {
				const importDeclaration: ESTree.ImportDeclaration = importDeclarations[id];
				const source: ESTree.Literal = syntaxMap['Literal'][(importDeclaration.source as any).uid] as ESTree.Literal;
				const absolutePath: string = path.join(filePath, source.value.toString()) + '.js';
				if(!setOfFilesAlreadyParsed.has(absolutePath)) listOfFilesToBeParsed.push(absolutePath);
			});
		}
	}

	return syntaxMap;
}