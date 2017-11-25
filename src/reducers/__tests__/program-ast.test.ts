import { programModel, ProgramModel, ASTMap } from '../program-ast';
import * as ESTree from 'estree';
import { UpdateASTNodeProperty } from '../../actions/edit-ast';
import { Literal, SimpleLiteral } from 'estree';

describe('program ast reducer', () => {

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
						left: { type: 'Literal', uid: '0005' },
						right: { type: 'Literal', uid: '0006' }
					}
				},
				// Literals in esprima also have a "raw" property, but it isn't
				// in the estree spec and we don't care about it.
				'Literal': {
					'0005': {
						type: 'Literal',
						value: 6,
					},
					'0006': {
						type: 'Literal',
						value: 7,
					}
				}
			} as any
		};
	});

	describe('updates an existing ASTMap on an UPDATE_AST_NODE action,', () => {

		it('where the update is about a primitive property', () => {

			const updateAction: UpdateASTNodeProperty = {
				type: 'UPDATE_AST_NODE',
				nodeType: 'Literal',
				uid: '0005',
				propName: 'value',
				newValue: 4
			};

			const expectedProgramModel: ProgramModel = {
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
							left: { type: 'Literal', uid: '0005' },
							right: { type: 'Literal', uid: '0006' }
						}
					},
					'Literal': {
						'0005': {
							type: 'Literal',
							value: 4,
						},
						'0006': {
							type: 'Literal',
							value: 7,
						}
					}
				} as any
			};

			const newProgramModel = programModel(initialProgramModel, updateAction);

			expect(newProgramModel).toEqual(expectedProgramModel);
		});
	});

	describe('updates an existing ASTMap on an INSERT_AST_SUBTREE action', () => {

		it('where the insert is happening within the tree (non-leaf)', () => {

			const updateAction: UpdateASTNodeProperty = {
				type: 'UPDATE_AST_NODE',
				nodeType: 'Literal',
				uid: '0005',
				propName: 'value',
				newValue: 4
			};

			const expectedProgramModel: ProgramModel = {
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
							init: { type: 'BinaryExpression', uid: '0007' }
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
							left: { type: 'Literal', uid: '0005' },
							right: { type: 'Literal', uid: '0006' }
						},
						'0007': {
							type: 'BinaryExpression',
							operator: '+',
							left: { type: 'BinaryExpression', uid: '0004' },
							right: { type: 'Literal', uid: '0008' }
						},
					},
					'Literal': {
						'0005': {
							type: 'Literal',
							value: 6,
						},
						'0006': {
							type: 'Literal',
							value: 7,
						},
						'0008': {
							type: 'Literal',
							value: 8,
						}
					}
				} as any
			};

			const newProgramModel = programModel(initialProgramModel, updateAction);

			expect(newProgramModel).toEqual(expectedProgramModel);
		})
	});
});