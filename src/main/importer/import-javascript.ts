/**
 * Created by mail on 08.12.2016.
 */
import { parse } from 'esprima';
import * as ESTree from 'estree';
import { readFileSync } from 'fs';
import { walk, Visitor } from '../../utils/estree-walker';
import { clone } from 'lodash';
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

	return parse(fileContent, { sourceType: module ? "module" : "script" });
}

export function importJavaScript(filePath: string): { [key:string]: { [key:string]: ESTree.Node } } {

	const ast = parseJavaScriptFile(loadFile(filePath), true);

	const syntaxMap: { [key:string]: { [key:string]: ESTree.Node } } = {};

	walk(ast, (
		mappedNode: any | null,
		node: ESTree.Node,
		mappedParent: any | null,
		parent: ESTree.Node,
		propertyName: string,
		index: number
	) => {

		const nodeType: string = node.type;
		if(!syntaxMap[nodeType]) syntaxMap[nodeType] = {};
		const typeMap = syntaxMap[nodeType];

		const newNode:ESTree.Node = clone(node);
		const newUId = nodeType === "Program" ? "1" : uid(10);
		typeMap[newUId] = newNode;
		if(index !== null && index !== undefined) {
			if(mappedParent) mappedParent[propertyName][index] = { type: newNode.type, uid: newUId };
		} else {
			if(mappedParent) mappedParent[propertyName] = { type: newNode.type, uid: newUId };
		}
		return newNode;
	});

	return syntaxMap;
}


// Pseudocode für Tree Normalization
/*
Für jeden node, in den wir eintreten:

- Lese seinen Typ aus dem property 'type'
- Schaue in der syntaxMap nach, ob wir für diesen Typ schon eine Map haben. Wenn nein,
  erstelle eine neue Map.
- Klone den node, das wird der mappedNode sein.
- Erzeuge eine UId für diesen mappedNode, die innerhalb der type Map in der syntaxMap eindeutig ist.
- Füge den mappedNode in der Map unter der UId hinzu.
- Nimm den mappedParent und ersetze dort die Referenz anhand des propertyName auf den aktuellen mappedNode mit einer
  ReferenceNode, die die Uid und den type dieses mappedNode enthält.
 */