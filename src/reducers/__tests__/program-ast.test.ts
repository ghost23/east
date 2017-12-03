import { programModel, ProgramModel, ASTMap } from '../program-ast';
import * as ESTree from 'estree';
import {
    INSERT_AST_SUBTREE, InsertASTSubtree, UPDATE_AST_NODE_PROPERTY,
    UpdateASTNodeProperty
} from '../../actions/edit-ast';
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
						sourceType: 'script',
                        __east_uid: '0001',
                        __east_parentNode: null,
                        __east_DescendantNodes: [
							{ type: 'VariableDeclaration', uid: '0002'},
							{ type: 'VariableDeclaration', uid: '0012'},
							{ type: 'VariableDeclaration', uid: '0003'},
							{ type: 'VariableDeclaration', uid: '0004'},
							{ type: 'VariableDeclaration', uid: '0005'},
							{ type: 'VariableDeclaration', uid: '0006'}
						]
					}
				},
				'VariableDeclaration': {
					'0002': {
						type: 'VariableDeclaration',
						declarations: [{ type: 'VariableDeclarator', uid: '0012' }],
						kind: 'var',
                        __east_uid: '0002',
                        __east_parentNode: { type: 'Program', uid: '0001'},
                        __east_DescendantNodes: [
                            { type: 'VariableDeclaration', uid: '0012'},
                            { type: 'Identifier', uid: '0003'},
                            { type: 'BinaryExpression', uid: '0004'},
                            { type: 'Literal', uid: '0005'},
                            { type: 'Literal', uid: '0006'}
                        ]
					}
				},
				'VariableDeclarator': {
					'0012': {
						type: 'VariableDeclarator',
						id: { type: 'Identifier', uid: '0003' },
						init: { type: 'BinaryExpression', uid: '0004' },
                        __east_uid: '0012',
                        __east_parentNode: { type: 'VariableDeclaration', uid: '0002'},
                        __east_DescendantNodes: [
                            { type: 'Identifier', uid: '0003'},
                            { type: 'BinaryExpression', uid: '0004'},
                            { type: 'Literal', uid: '0005'},
                            { type: 'Literal', uid: '0006'}
                        ]
					}
				},
				'Identifier': {
					'0003': {
						type: 'Identifier',
						name: 'answer',
                        __east_uid: '0003',
                        __east_parentNode: { type: 'VariableDeclarator', uid: '0012'},
                        __east_DescendantNodes: []
					}
				},
				'BinaryExpression': {
					'0004': {
						type: 'BinaryExpression',
						operator: '*',
						left: { type: 'Literal', uid: '0005' },
						right: { type: 'Literal', uid: '0006' },
                        __east_uid: '0004',
                        __east_parentNode: { type: 'VariableDeclarator', uid: '0012'},
                        __east_DescendantNodes: [
                            { type: 'Literal', uid: '0005'},
                            { type: 'Literal', uid: '0006'}
                        ]
					}
				},
				// Literals in esprima also have a "raw" property, but it isn't
				// in the estree spec and we don't care about it.
				'Literal': {
					'0005': {
						type: 'Literal',
						value: 6,
                        __east_uid: '0005',
                        __east_parentNode: { type: 'BinaryExpression', uid: '0004'},
                        __east_DescendantNodes: []
					},
					'0006': {
						type: 'Literal',
						value: 7,
                        __east_uid: '0006',
                        __east_parentNode: { type: 'BinaryExpression', uid: '0004'},
                        __east_DescendantNodes: []
					}
				}
			} as any
		};
	});

	describe('updates an existing ASTMap on an UPDATE_AST_NODE action,', () => {

		it('where the update is about a primitive property', () => {

			const updateAction: UpdateASTNodeProperty = {
				type: UPDATE_AST_NODE_PROPERTY,
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

		it('where the update is a node an thus results in an error', () => {

            const updateAction: UpdateASTNodeProperty = {
                type: UPDATE_AST_NODE_PROPERTY,
                nodeType: 'BinaryExpression',
                uid: '0004',
                propName: 'left',
                newValue: {
                    type: "BinaryExpression",
                    operator: "*",
                    left: {
                        type: "Literal",
                        value: 2,
                        raw: "2"
                    },
                    right: {
                        type: "Literal",
                        value: 4,
                        raw: "4"
                    }
                }
            };

            expect(() => { programModel(initialProgramModel, updateAction); }).toThrow();
		});
	});

	describe('updates an existing ASTMap on an INSERT_AST_SUBTREE action', () => {

		it('where the insert is happening within the tree (non-leaf)', () => {

			const updateAction: InsertASTSubtree = {
				type: INSERT_AST_SUBTREE,
				insertionPoint: {
					nodeType: 'VariableDeclarator',
					uid: '0012',
					propName: 'init'
				},
				subTree: {
                    type: "BinaryExpression",
                    operator: "+",
                    left: {
                        type: "BinaryExpression",
                        operator: "*",
                        left: {
                            type: "Literal",
                            value: 6,
                            raw: "6"
                        },
                        right: {
                            type: "Literal",
                            value: 7,
                            raw: "7"
                        }
                    },
                    right: {
                        type: "Literal",
                        value: 8,
                        raw: "8"
                    }
                }
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