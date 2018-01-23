/**
 * Created by mail on 12.12.2016.
 */

import {IMPORT_JAVASCRIPT_FILE, ImportJavaScriptfileAction} from '../actions/ast-import';
import {
    ADD_AST_SUBTREE, AddASTSubtree, REMOVE_AST_SUBTREE, RemoveASTSubtree,
    SET_AST_SUBTREE, SetASTSubtree, UPDATE_AST_NODE_PROPERTY,
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
    importedFiles: Set<string>,
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
    importedFiles: new Set<string>(),
    entryFile: "/",
    importError: null
};

function modifyParentsDescendantsLists(modifier: (uidList: NodeReference[]) => NodeReference[], node: ESTree.Node, astMap: ASTMap): ASTMap {
    astMap = clone(astMap);
    let parent: ESTree.Node = node;
    while (parent !== null && parent !== undefined) {
        const newASTSubMap = clone(astMap[parent.type]);
        parent = clone(parent);
        newASTSubMap[parent.__east_uid] = parent;
        astMap[parent.type] = newASTSubMap;
        parent.__east_DescendantNodes = modifier(parent.__east_DescendantNodes);
        const nextParentNodeRef = parent.__east_parentNode;
        parent = nextParentNodeRef ? astMap[nextParentNodeRef.type][nextParentNodeRef.uid] as ESTree.Node : null;
    }
    return astMap;
}

function removeSubtreeFromASTMap(action: Action, astMap: ASTMap): ASTMap {

    const typeAction = action as RemoveASTSubtree;
    let newASTMap: ASTMap = astMap;
    let newInsertionPointNode = newASTMap[typeAction.insertionPoint.nodeType][typeAction.insertionPoint.uid];

    const updateHasInsertionPointPropIndex = typeAction.insertionPoint.propIndex !== null && typeAction.insertionPoint.propIndex !== undefined;
    const oldInsertionPointPropValue = (newInsertionPointNode as any)[typeAction.insertionPoint.propName];
    const insertionPointPropIsArray = Array.isArray(oldInsertionPointPropValue);
    const oldPropNodeExistsAtInsertionPoint = insertionPointPropIsArray ?
        updateHasInsertionPointPropIndex &&
        typeAction.insertionPoint.propIndex < oldInsertionPointPropValue.length &&
        isReferenceNode(oldInsertionPointPropValue[typeAction.insertionPoint.propIndex]) :
        oldInsertionPointPropValue !== null && oldInsertionPointPropValue !== undefined && isReferenceNode(oldInsertionPointPropValue);

    if(oldPropNodeExistsAtInsertionPoint) {
        let oldInsertionPointPropNodeRef: NodeReference;
        if(insertionPointPropIsArray) {
            oldInsertionPointPropNodeRef = oldInsertionPointPropValue[typeAction.insertionPoint.propIndex];
            oldInsertionPointPropValue.splice(typeAction.insertionPoint.propIndex, 1);
        } else {
            oldInsertionPointPropNodeRef = oldInsertionPointPropValue;
            (newInsertionPointNode as any)[typeAction.insertionPoint.propName] = null;
        }
        const oldInsertionPointPropNode: ESTree.Node = newASTMap[oldInsertionPointPropNodeRef.type][oldInsertionPointPropNodeRef.uid];

        // So we DO have an existing prop node at the insertion point. And it probably might not even be
        // a single node, but a whole subtree waiting there. We now need to remove the whole subtree, because
        // we want to replace it with our new subtree. Removing here means, we need to remove all nodes
        // of that old subtree from its parents descendants lists, then remove the actual nodes from the astMap
        const oldInsertionPointPropNodeAndDescendants = oldInsertionPointPropNode.__east_DescendantNodes.concat(oldInsertionPointPropNodeRef);

        newASTMap = modifyParentsDescendantsLists(
            descendants =>
                descendants.filter(
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

    return newASTMap;
}

function addSubtreeToASTMap(action: Action, astMap: ASTMap): ASTMap {

    const typeAction = action as AddASTSubtree;
    let newASTMap: ASTMap = astMap;
    let newInsertionPointNode = newASTMap[typeAction.insertionPoint.nodeType][typeAction.insertionPoint.uid];
    const potentialOldPropNode = (newInsertionPointNode as any)[typeAction.insertionPoint.propName];
    const insertionPointPropIsArray = Array.isArray(potentialOldPropNode);

    if(potentialOldPropNode !== null && potentialOldPropNode !== undefined && !insertionPointPropIsArray) {
       throw new Error(`addSubtreeToASTMap found existing property at insertionPoint (${typeAction.insertionPoint.nodeType}[${typeAction.insertionPoint.uid}].${typeAction.insertionPoint.propName}). Remove first before adding.`);
    }

    // Now, let's prepare the root node of the new subtree. We need to give it a uid, so that we can
    // find it again, after we put it in the astMap.
    const newSubTreeRootNodeUid = uid(10);
    let newSubTreeRootNode = typeAction.subTree;
    newSubTreeRootNode.__east_uid = newSubTreeRootNodeUid;
    const updateHasInsertionPointPropIndex = typeAction.insertionPoint.propIndex !== null && typeAction.insertionPoint.propIndex !== undefined;
    const newSubTreeRootNodeRef: NodeReference = {type: newSubTreeRootNode.type, uid: newSubTreeRootNodeUid};

    // Now let's integrate our little subtree into our big astMap
    newASTMap = createSyntaxMapsFromTree(newSubTreeRootNode, '', newASTMap, true);
    newSubTreeRootNode = newASTMap[newSubTreeRootNode.type][newSubTreeRootNodeUid]; // newSubTreeRootNode had probably been cloned in createSyntaxMapsFromTree()

    // OK, now the subtree is in the astMap, but it hasn't been connected to the overall tree so far.
    // Since our connections are bidirectional, let's do the child->parent connection first.
    newSubTreeRootNode.__east_parentNode = {
        type: typeAction.insertionPoint.nodeType,
        uid: typeAction.insertionPoint.uid
    };

    // Now for the parents->child connections. Let's add the NEW subtrees descendants to the insert point node and its parents
    // First, we add/set the root node reference of our NEW subtree at the insertion point property.
    if (insertionPointPropIsArray) {
        if (updateHasInsertionPointPropIndex) {
            ((newInsertionPointNode as any)[typeAction.insertionPoint.propName] as Array<any>).splice(typeAction.insertionPoint.propIndex, 0, newSubTreeRootNodeRef);
        } else {
            ((newInsertionPointNode as any)[typeAction.insertionPoint.propName] as Array<any>).push(newSubTreeRootNodeRef);
        }
    } else {
        (newInsertionPointNode as any)[typeAction.insertionPoint.propName] = newSubTreeRootNodeRef;
    }

    // Next, we need to add all the descendants of our new subtree (including the root node of that subtree) to
    // the descendants lists of the parent chain of the insertion point node (including the insertion point node).
    const newSubTreeRootNodeDescendants = newSubTreeRootNode.__east_DescendantNodes.concat(newSubTreeRootNodeRef);

    newASTMap = modifyParentsDescendantsLists(
        descendants => descendants.concat(newSubTreeRootNodeDescendants),
        newInsertionPointNode,
        newASTMap
    );

    return newASTMap;
}

export function programModel(state: ProgramModel = DEFAULT_PROGRAM_MODEL, action: Action): ProgramModel {
    switch (action.type) {
        case IMPORT_JAVASCRIPT_FILE: {
            let programModel: ProgramModel;
            try {
                let importResult = importJavaScript((action as ImportJavaScriptfileAction).filePath);
                programModel = {
                    astMap: importResult.syntaxMap,
                    importedFiles: new Set<string>([...state.importedFiles, ...importResult.importedFiles]),
                    entryFile: (action as ImportJavaScriptfileAction).filePath,
                    importError: null
                };
            } catch (e) {
                programModel = {
                    ...state,
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
            const propIsArray = Array.isArray((newNode as any)[typeAction.propName]);

            if (isNode(typeAction.newValue)) {
                throw new Error('UPDATE_AST_NODE_PROPERTY newValue must not be a Node');
            } else {
                if(propIsArray) {
                    if(((newNode as any)[typeAction.propName] as Array<any>).length > 0 && isNode(((newNode as any)[typeAction.propName] as Array<any>)[0])) {
                        throw new Error('UPDATE_AST_NODE_PROPERTY prop to be updated must not be an Array of nodes');
                    }
                    if (hasPropIndex) {
                        if(typeAction.propIndex < 0 || typeAction.propIndex >= ((newNode as any)[typeAction.propName] as Array<any>).length) {
                            throw new Error('UPDATE_AST_NODE_PROPERTY propIndex out of range');
                        }
                        ((newNode as any)[typeAction.propName] as Array<any>)[typeAction.propIndex] = typeAction.newValue;
                    } else {
                        ((newNode as any)[typeAction.propName] as Array<any>).push(typeAction.newValue);
                    }
                } else {
                    if(isNode((newNode as any)[typeAction.propName])) {
                        throw new Error('UPDATE_AST_NODE_PROPERTY prop to be updated must not be a Node');
                    }
                    (newNode as any)[typeAction.propName] = typeAction.newValue;
                }
            }

            newASTMap[typeAction.nodeType] = newASTSubMap;
            newASTSubMap[typeAction.uid] = newNode;

            return {
                ...state,
				astMap: newASTMap
            }
        }
        case SET_AST_SUBTREE: {

            let newASTMap: ASTMap = state.astMap;

            newASTMap = removeSubtreeFromASTMap(action, newASTMap);
            newASTMap = addSubtreeToASTMap(action, newASTMap);

            return {
				...state,
				astMap: newASTMap
            }
        }
        case ADD_AST_SUBTREE: {

            let newASTMap: ASTMap = state.astMap;

            newASTMap = addSubtreeToASTMap(action, newASTMap);

            return {
				...state,
				astMap: newASTMap
            }
        }
        case REMOVE_AST_SUBTREE: {

            let newASTMap: ASTMap = state.astMap;

            newASTMap = removeSubtreeFromASTMap(action, newASTMap);

            return {
				...state,
				astMap: newASTMap
            }
        }
        default: {
            return state;
        }
    }
}