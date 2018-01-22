import { programModel, ProgramModel, ASTMap } from '../program-ast';
import * as ESTree from 'estree';
import {
    ADD_AST_SUBTREE,
    AddASTSubtree, REMOVE_AST_SUBTREE, RemoveASTSubtree,
    SET_AST_SUBTREE, SetASTSubtree, UPDATE_AST_NODE_PROPERTY,
    UpdateASTNodeProperty
} from '../../actions/edit-ast';
import { Literal, SimpleLiteral } from 'estree';
import {NodeReference} from "../../utils/constants";

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
			importedFiles: new Set(['some/path/to/file.js']),
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
							{ type: 'VariableDeclarator', uid: '0012'},
							{ type: 'Identifier', uid: '0003'},
							{ type: 'BinaryExpression', uid: '0004'},
							{ type: 'Literal', uid: '0005'},
							{ type: 'Literal', uid: '0006'}
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



			const newProgramModel = programModel(initialProgramModel, updateAction);

			expect(newProgramModel.astMap['Literal']['0005']).toEqual({
                type: 'Literal',
                value: 4,
                __east_uid: '0005',
                __east_parentNode: { type: 'BinaryExpression', uid: '0004'},
                __east_DescendantNodes: []
            });
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

	describe('updates an existing ASTMap on a SET_AST_SUBTREE action', () => {

        it('where the insert is happening at a single property', () => {

            const updateAction: SetASTSubtree = {
                type: SET_AST_SUBTREE,
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

            const newProgramModel = programModel(initialProgramModel, updateAction);

            const binaryExpressionMap = newProgramModel.astMap['BinaryExpression'];
            expect(Object.keys(binaryExpressionMap)).toHaveLength(2);

            const programNode: ESTree.Node = newProgramModel.astMap['Program']['0001'];
            expect(programNode.__east_DescendantNodes).toHaveLength(8);

            const literalMap = newProgramModel.astMap['Literal'];
            expect(Object.keys(literalMap)).toHaveLength(3);

            const insertionPointNode: ESTree.Node = newProgramModel.astMap['VariableDeclarator']['0012'];
            expect(((insertionPointNode as ESTree.VariableDeclarator).init as any).uid).not.toBe('0004');
            expect((insertionPointNode as ESTree.VariableDeclarator).__east_DescendantNodes).not.toEqual([
                {type: 'Identifier', uid: '0003'},
                {type: 'BinaryExpression', uid: '0004'},
                {type: 'Literal', uid: '0005'},
                {type: 'Literal', uid: '0006'}
            ]);
            expect((insertionPointNode as ESTree.VariableDeclarator).__east_DescendantNodes).toHaveLength(6);
        });

        it('where the insert is happening at a list property (in the middle)', () => {

            /*
            {
                "type": "Program",
                "body": [
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "Identifier",
                            "name": "check"
                        }
                    },
                    {
                        "type": "ExpressionStatement",
                        "expression": {
                            "type": "Identifier",
                            "name": "chuck"
                        }
                    }
                ],
                "sourceType": "script"
            }
            */

            initialProgramModel = {
                importError: null,
                importedFiles: ['some/path/to/file.js'],
                entryFile: 'some/path/to/file.js',
                astMap: {
                    'Program': {
                        '0001': {
                            type: 'Program',
                            body: [{ type: 'ExpressionStatement', uid: '0002' }, { type: 'ExpressionStatement', uid: '0003' }],
                            sourceType: 'script',
                            __east_uid: '0001',
                            __east_parentNode: null,
                            __east_DescendantNodes: [
                                { type: 'ExpressionStatement', uid: '0002'},
                                { type: 'ExpressionStatement', uid: '0003'},
                                { type: 'Identifier', uid: '0004'},
                                { type: 'Identifier', uid: '0005'}
                            ]
                        }
                    },
                    'ExpressionStatement': {
                        '0002': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0004' },
                            __east_uid: '0002',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: [{ type: 'Identifier', uid: '0004' }]
                        },
                        '0003': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0005' },
                            __east_uid: '0003',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: [{ type: 'Identifier', uid: '0005' }]
                        }
                    },
                    'Identifier': {
                        '0004': {
                            type: 'Identifier',
                            name: 'check',
                            __east_uid: '0004',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0002'},
                            __east_DescendantNodes: []
                        },
                        '0005': {
                            type: 'Identifier',
                            name: 'chuck',
                            __east_uid: '0005',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0003'},
                            __east_DescendantNodes: []
                        }
                    }
                }
            } as any;

            const updateAction: SetASTSubtree = {
                type: SET_AST_SUBTREE,
                insertionPoint: {
                    nodeType: 'Program',
                    uid: '0001',
                    propName: 'body',
                    propIndex: 1
                },
                subTree: {
                    type: "ExpressionStatement",
                    expression: {
                        type: "Identifier",
                        name: "debug"
                    }
                }
            };

            const newProgramModel = programModel(initialProgramModel, updateAction);

            const identifierMap = newProgramModel.astMap['Identifier'];
            expect(Object.keys(identifierMap)).toHaveLength(2);

            const programNode: ESTree.Program = newProgramModel.astMap['Program']['0001'] as ESTree.Program;
            expect(programNode.__east_DescendantNodes).toHaveLength(4);

            expect (programNode.body).toHaveLength(2);

            const body1NodeReference = (programNode.body as any)[1] as NodeReference;

            const body1Node: ESTree.ExpressionStatement = newProgramModel.astMap[body1NodeReference.type][body1NodeReference.uid] as ESTree.ExpressionStatement;

            expect((body1Node.expression as any).uid).not.toBe('0003');

            const expressionStatementMap = newProgramModel.astMap['ExpressionStatement'];
            expect(Object.keys(expressionStatementMap)).toHaveLength(2);
        });
    });

    describe('updates an existing ASTMap on an ADD_AST_SUBTREE action', () => {

        it('where the insert is happening at a list property (amending at the end)', () => {

            const updateAction: AddASTSubtree = {
                type: ADD_AST_SUBTREE,
                insertionPoint: {
                    nodeType: 'Program',
                    uid: '0001',
                    propName: 'body'
                },
                subTree: {
                    type: "ExpressionStatement",
                    expression: {
                        type: "Identifier",
                        name: "debug"
                    }
                }
            };

            const newProgramModel = programModel(initialProgramModel, updateAction);

            const identifierMap = newProgramModel.astMap['Identifier'];
            expect(Object.keys(identifierMap)).toHaveLength(2);

            const programNode: ESTree.Program = newProgramModel.astMap['Program']['0001'] as ESTree.Program;
            expect(programNode.__east_DescendantNodes).toHaveLength(8);

            expect (programNode.body).toHaveLength(2);

            const expressionStatementMap = newProgramModel.astMap['ExpressionStatement'];
            expect(Object.keys(expressionStatementMap)).toHaveLength(1);
        });

        it('where the insert is happening at a list property (in the middle)', () => {

            /*
                {
                    "type": "Program",
                    "body": [
                        {
                            "type": "ExpressionStatement",
                            "expression": {
                                "type": "Identifier",
                                "name": "check"
                            }
                        },
                        {
                            "type": "ExpressionStatement",
                            "expression": {
                                "type": "Identifier",
                                "name": "chuck"
                            }
                        }
                    ],
                    "sourceType": "script"
                }
                */

            initialProgramModel = {
                importError: null,
                importedFiles: ['some/path/to/file.js'],
                entryFile: 'some/path/to/file.js',
                astMap: {
                    'Program': {
                        '0001': {
                            type: 'Program',
                            body: [{ type: 'ExpressionStatement', uid: '0002' }, { type: 'ExpressionStatement', uid: '0003' }],
                            sourceType: 'script',
                            __east_uid: '0001',
                            __east_parentNode: null,
                            __east_DescendantNodes: [
                                { type: 'ExpressionStatement', uid: '0002'},
                                { type: 'ExpressionStatement', uid: '0003'},
                                { type: 'Identifier', uid: '0004'},
                                { type: 'Identifier', uid: '0005'}
                            ]
                        }
                    },
                    'ExpressionStatement': {
                        '0002': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0004' },
                            __east_uid: '0003',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: []
                        },
                        '0003': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0005' },
                            __east_uid: '0003',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: []
                        }
                    },
                    'Identifier': {
                        '0004': {
                            type: 'Identifier',
                            name: 'check',
                            __east_uid: '0004',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0002'},
                            __east_DescendantNodes: []
                        },
                        '0005': {
                            type: 'Identifier',
                            name: 'chuck',
                            __east_uid: '0005',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0003'},
                            __east_DescendantNodes: []
                        }
                    }
                }
            } as any;

            const updateAction: AddASTSubtree = {
                type: ADD_AST_SUBTREE,
                insertionPoint: {
                    nodeType: 'Program',
                    uid: '0001',
                    propName: 'body',
                    propIndex: 1
                },
                subTree: {
                    type: "ExpressionStatement",
                    expression: {
                        type: "Identifier",
                        name: "debug"
                    }
                }
            };

            const newProgramModel = programModel(initialProgramModel, updateAction);

            const identifierMap = newProgramModel.astMap['Identifier'];
            expect(Object.keys(identifierMap)).toHaveLength(3);

            const programNode: ESTree.Program = newProgramModel.astMap['Program']['0001'] as ESTree.Program;
            expect(programNode.__east_DescendantNodes).toHaveLength(6);

            expect (programNode.body).toHaveLength(3);

            const body1NodeReference = (programNode.body as any)[1] as NodeReference;
            const body2NodeReference = (programNode.body as any)[2] as NodeReference;

            const body1Node: ESTree.ExpressionStatement = newProgramModel.astMap[body1NodeReference.type][body1NodeReference.uid] as ESTree.ExpressionStatement;
            const body2Node: ESTree.ExpressionStatement = newProgramModel.astMap[body2NodeReference.type][body2NodeReference.uid] as ESTree.ExpressionStatement;

            expect((body1Node.expression as any).uid).not.toBe('0005');
            expect((body2Node.expression as any).uid).toBe('0005');

            const expressionStatementMap = newProgramModel.astMap['ExpressionStatement'];
            expect(Object.keys(expressionStatementMap)).toHaveLength(3);
        });
	});

    describe('updates an existing ASTMap on a REMOVE_AST_SUBTREE action', () => {

        it('where the remove is of a single property', () => {

            const updateAction: RemoveASTSubtree = {
                type: REMOVE_AST_SUBTREE,
                insertionPoint: {
                    nodeType: 'VariableDeclarator',
                    uid: '0012',
                    propName: 'init'
                }
            };

            const newProgramModel = programModel(initialProgramModel, updateAction);

            const binaryExpressionMap = newProgramModel.astMap['BinaryExpression'];
            if(binaryExpressionMap) {
                expect(Object.keys(binaryExpressionMap).length).toBeLessThanOrEqual(0);
            }

            const programNode: ESTree.Node = newProgramModel.astMap['Program']['0001'];
            expect(programNode.__east_DescendantNodes).toHaveLength(3);

            const literalMap = newProgramModel.astMap['Literal'];
            if(literalMap) {
                expect(Object.keys(literalMap).length).toBeLessThanOrEqual(0);
            }

            const variableDeclaratorMap = newProgramModel.astMap['VariableDeclarator'];
            const variableDeclaratorNode: ESTree.VariableDeclarator = variableDeclaratorMap['0012'] as any;
            expect(variableDeclaratorNode.init).toBeNull();
            expect(variableDeclaratorNode.__east_DescendantNodes).toHaveLength(1);
        });

        it('where the remove is of an item from a list property (in the middle)', () => {

            initialProgramModel = {
                importError: null,
                importedFiles: ['some/path/to/file.js'],
                entryFile: 'some/path/to/file.js',
                astMap: {
                    'Program': {
                        '0001': {
                            type: 'Program',
                            body: [
                                { type: 'ExpressionStatement', uid: '0002' },
                                { type: 'ExpressionStatement', uid: '0003' },
                                { type: 'ExpressionStatement', uid: '0004'}
                            ],
                            sourceType: 'script',
                            __east_uid: '0001',
                            __east_parentNode: null,
                            __east_DescendantNodes: [
                                { type: 'ExpressionStatement', uid: '0002'},
                                { type: 'ExpressionStatement', uid: '0003'},
                                { type: 'ExpressionStatement', uid: '0004'},
                                { type: 'Identifier', uid: '0005'},
                                { type: 'Identifier', uid: '0006'},
                                { type: 'Identifier', uid: '0007'}
                            ]
                        }
                    },
                    'ExpressionStatement': {
                        '0002': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0005' },
                            __east_uid: '0002',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: [{ type: 'Identifier', uid: '0005' }]
                        },
                        '0003': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0006' },
                            __east_uid: '0003',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: [{ type: 'Identifier', uid: '0006' }]
                        },
                        '0004': {
                            type: 'ExpressionStatement',
                            expression: { type: 'Identifier', uid: '0007' },
                            __east_uid: '0004',
                            __east_parentNode: { type: 'Program', uid: '0001'},
                            __east_DescendantNodes: [{ type: 'Identifier', uid: '0007' }]
                        }
                    },
                    'Identifier': {
                        '0005': {
                            type: 'Identifier',
                            name: 'check',
                            __east_uid: '0005',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0002'},
                            __east_DescendantNodes: []
                        },
                        '0006': {
                            type: 'Identifier',
                            name: 'chuck',
                            __east_uid: '0006',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0003'},
                            __east_DescendantNodes: []
                        },
                        '0007': {
                            type: 'Identifier',
                            name: 'debug',
                            __east_uid: '0007',
                            __east_parentNode: { type: 'ExpressionStatement', uid: '0004'},
                            __east_DescendantNodes: []
                        }
                    }
                }
            } as any;

            const updateAction: RemoveASTSubtree = {
                type: REMOVE_AST_SUBTREE,
                insertionPoint: {
                    nodeType: 'Program',
                    uid: '0001',
                    propName: 'body',
                    propIndex: 1
                }
            };

            const newProgramModel = programModel(initialProgramModel, updateAction);

            const identifierMap = newProgramModel.astMap['Identifier'];
            expect(Object.keys(identifierMap)).toHaveLength(2);

            const programNode: ESTree.Program = newProgramModel.astMap['Program']['0001'] as ESTree.Program;
            expect(programNode.__east_DescendantNodes).toHaveLength(4);

            expect (programNode.body).toHaveLength(2);

            const body1NodeReference = (programNode.body as any)[1] as NodeReference;

            const body1Node: ESTree.ExpressionStatement = newProgramModel.astMap[body1NodeReference.type][body1NodeReference.uid] as ESTree.ExpressionStatement;

            expect((body1Node.expression as any).uid).toBe('0007');

            const expressionStatementMap = newProgramModel.astMap['ExpressionStatement'];
            expect(Object.keys(expressionStatementMap)).toHaveLength(2);
        });
    });
});