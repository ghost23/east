import { programModel, ProgramModel, ASTMap } from '../program-ast';
import * as ESTree from 'estree';
import { UpdateASTNode } from '../../actions/update-ast';
import { Literal, SimpleLiteral } from 'estree';

describe('program ast reducer', () => {

	describe('updates an existing ASTMap on an UPDATE_AST_NODE action,', () => {

		let initialProgramModel: ProgramModel;

		/*
		{
			"type": "Program",
			"body": [
				{
					"type": "VariableDeclaration",
					"declarations": [
						{
							"type": "VariableDeclarator",
							"id": {
								"type": "Identifier",
								"name": "answer"
							},
							"init": {
								"type": "BinaryExpression",
								"operator": "*",
								"left": {
									"type": "Literal",
									"value": 6,
									"raw": "6"
								},
								"right": {
									"type": "Literal",
									"value": 7,
									"raw": "7"
								}
							}
						}
					],
					"kind": "var"
				}
			],
			"sourceType": "script"
		}
		 */

		beforeEach(() => {
			initialProgramModel = {
				importError: null,
				importedFiles: ['some/path/to/file.js'],
				entryFile: 'some/path/to/file.js',
				astMap: {
					'Program': {
						'0001': {
							type: 'Program',
							body: [{ type: 'VariableDeclaration', uid: '0002' }],
							sourceType: 'script'
						}
					},
					'VariableDeclaration': {
						'0002': {
							type: 'VariableDeclaration',
							declarations: [{ type: 'VariableDeclarator', uid: '0012' }],
							kind: 'var'
						}
					},
					'VariableDeclarator': {
						'0012': {
							type: 'VariableDeclarator',
							id: { type: 'Identifier', uid: '0003' },
							init: { type: 'BinaryExpression', uid: '0004' }
						}
					},
					'Identifier': {
						'0003': {
							type: 'Identifier',
							name: 'answer'
						}
					},
					'BinaryExpression': {
						'0004': {
							type: 'BinaryExpression',
							operator: '*',
							left: { type: 'Literal', uid: '0004' },
							right: { type: 'Literal', uid: '0005' }
						}
					},
					'Literal': {
						'0005': {
							type: 'Literal',
							value: 6,
							raw: '6'
						},
						'0006': {
							type: 'Literal',
							value: 7,
							raw: '7'
						}
					}
				} as any
			};
		});

		it('where the update is about a primitive property', () => {

			const updateAction: UpdateASTNode = {
				type: 'UPDATE_AST_NODE',
				nodeType: 'Literal',
				uid: '0005',
				propName: 'value',
				newValue: 4
			}
		});

		it('where the update is about a new ESTree Node', () => {

		});
	});
});