/**
 * Created by mail on 12.12.2016.
 */

import {IMPORT_JAVASCRIPT_FILE, ImportJavaScriptfileAction} from '../actions/ast-import';
import {
    INSERT_AST_SUBTREE, InsertASTSubtree, UPDATE_AST_NODE_PROPERTY,
    UpdateASTNodeProperty
} from '../actions/edit-ast';
import {Action} from 'redux';
import {createSyntaxMapsFromTree, importJavaScript} from '../main/importer/import-javascript';
import * as ESTree from 'estree';
import {clone} from 'lodash';

const uid = require('uid');
import {isNode, isReferenceNode} from '../utils/estree-walker';
import {NodeReference} from '../utils/constants';
import {selectASTNodeByTypeAndId} from "../selectors/select-ast-node";


export type ASTMap = {
    [nodeType: string]: { [uid: string]: ESTree.Node }
};

export interface ProgramModel {
    astMap: ASTMap,
    importedFiles: string[],
    entryFile: string,
    importError: Error
}

const DEFAULT_AST: ASTMap = {};
DEFAULT_AST["Program"] = {};
DEFAULT_AST["Program"]["/"] = {
    body: [],
    sourceType: "module",
    type: "Program",
    loc: null
};

const DEFAULT_PROGRAM_MODEL: ProgramModel = {
    astMap: DEFAULT_AST,
    importedFiles: [],
    entryFile: "/",
    importError: null
};

function modifyParentsDescendantsLists(modifier: (uidList: NodeReference[]) => NodeReference[], node: ESTree.Node, astMap: ASTMap): void {
    let parent: ESTree.Node = node;
    while (parent !== null && parent !== undefined) {
        parent.__east_DescendantNodes = modifier(parent.__east_DescendantNodes);
        const nextParentNodeRef = parent.__east_parentNode;
        parent = nextParentNodeRef ? astMap[nextParentNodeRef.type][nextParentNodeRef.uid] as ESTree.Node : null;
    }
}

export function programModel(state: ProgramModel = DEFAULT_PROGRAM_MODEL, action: Action): ProgramModel {
    switch (action.type) {
        case IMPORT_JAVASCRIPT_FILE: {
            let programModel: ProgramModel;
            try {
                let astMap = importJavaScript((action as ImportJavaScriptfileAction).filePath);
                programModel = {
                    astMap,
                    importedFiles: state.importedFiles.concat((action as ImportJavaScriptfileAction).filePath),
                    entryFile: (action as ImportJavaScriptfileAction).filePath,
                    importError: null
                };
            } catch (e) {
                programModel = {
                    astMap: state.astMap,
                    importedFiles: state.importedFiles,
                    entryFile: state.entryFile,
                    importError: {name: e.name, message: e.message, stack: e.stack}
                };
            }
            return programModel;
        }
        case UPDATE_AST_NODE_PROPERTY: {
            const typeAction = action as UpdateASTNodeProperty;
            const newASTMap = clone(state.astMap);
            const newASTSubMap = clone(newASTMap[typeAction.nodeType]);
            const newNode = clone(newASTSubMap[typeAction.uid]);
            const hasPropIndex = typeAction.propIndex !== null && typeAction.propIndex !== undefined;

            if (isNode(typeAction.newValue)) {
                throw new Error('UPDATE_AST_NODE_PROPERTY newValue must not be a Node');
            } else {
                if (hasPropIndex) {
                    ((newNode as any)[typeAction.propName] as Array<any>)[typeAction.propIndex] = typeAction.newValue;
                } else {
                    (newNode as any)[typeAction.propName] = typeAction.newValue;
                }
            }

            newASTMap[typeAction.nodeType] = newASTSubMap;
            newASTSubMap[typeAction.uid] = newNode;

            return {
                astMap: newASTMap,
                importedFiles: state.importedFiles,
                entryFile: state.entryFile,
                importError: state.importError
            }
        }
        case INSERT_AST_SUBTREE: {

            const typeAction = action as InsertASTSubtree;

            // First, let's prepare the root node of the subtree. We need to give it a uid, so that we can
            // find it again, after we put it in the astMap.
            const newSubTreeRootNodeUid = uid(10);
            let newSubTreeRootNode = typeAction.subTree;
            newSubTreeRootNode.__east_uid = newSubTreeRootNodeUid;
            const newSubTreeRootNodeRef: NodeReference = {type: newSubTreeRootNode.type, uid: newSubTreeRootNodeUid};

            // Now let's integrate our little subtree into our big astMap
            const newASTMap = createSyntaxMapsFromTree(newSubTreeRootNode, '', state.astMap, true);
            console.log('node type', newSubTreeRootNode.type, 'uid:', newSubTreeRootNodeUid);
            console.log('newASTMap:\n', JSON.stringify(newASTMap));
            newSubTreeRootNode = newASTMap[newSubTreeRootNode.type][newSubTreeRootNodeUid]; // newSubTreeRootNode had probably been cloned in createSyntaxMapsFromTree()

            // As a preparation for the things to come, let's first clone the things, that will be updated. You know, redux.
            const newASTSubMap = clone(newASTMap[typeAction.insertionPoint.nodeType]);
            const newInsertionPointNode = clone(newASTSubMap[typeAction.insertionPoint.uid]);

            // OK, so in a nutshell, we have to remove any existing subtree, that might sit at the insertion point
            // and then we add the new subtree in there.

            // First some checks to know, how and where exactly to insert the subtree and if there is an existing prop node at the insertion point.
            const updateHasInsertionPointPropIndex = typeAction.insertionPoint.propIndex !== null && typeAction.insertionPoint.propIndex !== undefined;
            const oldInsertionPointProp = (newInsertionPointNode as any)[typeAction.insertionPoint.propName];
            const insertionPointPropIsArray = Array.isArray(oldInsertionPointProp);
            const oldPropNodeExistsAtInsertionPoint = insertionPointPropIsArray ?
                updateHasInsertionPointPropIndex &&
                    typeAction.insertionPoint.propIndex < oldInsertionPointProp.length &&
                    isReferenceNode(oldInsertionPointProp[typeAction.insertionPoint.propIndex]) :
                oldInsertionPointProp !== null && oldInsertionPointProp !== undefined && isReferenceNode(oldInsertionPointProp);

            if(oldPropNodeExistsAtInsertionPoint) {
                let oldInsertionPointPropNodeRef: NodeReference;
                if(insertionPointPropIsArray) {
                    oldInsertionPointPropNodeRef = oldInsertionPointProp[typeAction.insertionPoint.propIndex];
                } else {
                    oldInsertionPointPropNodeRef = oldInsertionPointProp;
                }
                const oldInsertionPointPropNode: ESTree.Node = newASTMap[oldInsertionPointPropNodeRef.type][oldInsertionPointPropNodeRef.uid];

                // So we DO have an existing prop node at the insertion point. And it probably might not even be
                // a single node, but a whole subtree waiting there. We now need to remove the whole subtree, because
                // we want to replace it with our new subtree. Removing here means, we need to remove all nodes
                // of that old subtree from its parents descendants lists, then remove the actual nodes from the astMap
                const oldInsertionPointPropNodeAndDescendants = oldInsertionPointPropNode.__east_DescendantNodes.concat(oldInsertionPointPropNodeRef);

                modifyParentsDescendantsLists(descendants => descendants.filter(
                    candidateRef => oldInsertionPointPropNodeAndDescendants.findIndex(
                            descRefForRemoval =>
                                candidateRef.type === descRefForRemoval.type && candidateRef.uid === descRefForRemoval.uid
                        ) < 0 // If the descendantForRemoval is NOT found (index == -1), then keep the candidate
                    ),
                    newInsertionPointNode, newASTMap
                );

                // So the parents->child connection have been removed. Now let's finish this step by removing
                // the actual nodes from the astMap

                oldInsertionPointPropNodeAndDescendants.forEach((nodeReference: NodeReference) => {
                    delete newASTMap[nodeReference.type][nodeReference.uid];
                });
            }

            // OK, now to new subtree. It is already in the astMap, but it hasn't been connected to the overall tree so far.
            // Since our connections are bidirectional, let's do the child->parent connection first.
            newSubTreeRootNode.__east_parentNode = {
                type: typeAction.insertionPoint.nodeType,
                uid: typeAction.insertionPoint.uid
            };

            // Now for the parents->child connections. Let's add the NEW subtrees descendants to the insert point node and its parents
            // First, we add/set the root node reference of our NEW subtree at the insertion point property.
            if (insertionPointPropIsArray) {
                if (updateHasInsertionPointPropIndex) {
                    ((newInsertionPointNode as any)[typeAction.insertionPoint.propName] as Array<any>)[typeAction.insertionPoint.propIndex] = newSubTreeRootNodeRef;
                } else {
                    ((newInsertionPointNode as any)[typeAction.insertionPoint.propName] as Array<any>).push(newSubTreeRootNodeRef);
                }
            } else {
                (newInsertionPointNode as any)[typeAction.insertionPoint.propName] = newSubTreeRootNodeRef;
            }

            // Next, we need to add all the descendants of our new subtree (including the root node of that subtree) to
            // the descendants lists of the parent chain of the insertion point node (including the insertion point node).
            const newSubTreeRootNodeDescendants = newSubTreeRootNode.__east_DescendantNodes.concat(newSubTreeRootNodeRef);

            modifyParentsDescendantsLists(
                descendants => descendants.concat(newSubTreeRootNodeDescendants),
                newInsertionPointNode,
                newASTMap
            );

            // Done! 🤓

            return {
                astMap: newASTMap,
                importedFiles: state.importedFiles,
                entryFile: state.entryFile,
                importError: state.importError
            }
        }
        default: {
            return state;
        }
    }
}