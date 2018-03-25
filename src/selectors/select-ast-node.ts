import {EastStore} from '../reducers/reducers';
import * as ESTree from 'estree';
import {
    ImportDefaultSpecifier,
    ImportNamespaceSpecifier,
    ImportSpecifier,
    ExportSpecifier,
    ExportDefaultDeclaration,
    ExportAllDeclaration, Identifier, Program, VariableDeclarator, ExportNamedDeclaration, VariableDeclaration
} from 'estree';
import * as path from 'path';
import {specifier} from '../ast-views/textual/components/import-specifier-common/ImportSpecifierCommonView.scss';
import {NodeReference} from '../utils/constants';
import {Declaration} from 'postcss';
import {identifier} from "../ast-views/textual/components/identifier/IdentifierView.scss";

export function selectASTNodeByTypeAndId(state: EastStore, type: string, uid: string): ESTree.Node {
    return !nou(type) && !nou(uid) ? state.programModel.astMap[type][uid] : null;
}

export function selectNextParentByType(state: EastStore, node: ESTree.Node, type: string): ESTree.Node | null {
    let currentParent: ESTree.Node = node;
    while (currentParent.__east_parentNode !== null) {
        currentParent = selectASTNodeByTypeAndId(state, currentParent.__east_parentNode.type, currentParent.__east_parentNode.uid);
        if (currentParent.type === type) {
            return currentParent;
        }
    }
    return null;
}

export function selectDescendantsByType(state: EastStore, node: ESTree.Node, type: string): ESTree.Node[] {
    const descendantsByType = node.__east_DescendantNodes.filter(descendant => descendant.type === type);
    return descendantsByType.map(descendant => selectASTNodeByTypeAndId(state, descendant.type, descendant.uid));
}

export function selectAllFilesList(state: EastStore): string[] {
    return [...state.programModel.importedFiles];
}

export function selectEntryFile(state: EastStore): string {
    return state.programModel.entryFile;
}

export function selectEntryFileProgramNode(state: EastStore): ESTree.Program {
    return selectASTNodeByTypeAndId(
        state,
        "Program",
        selectEntryFile(
            state
        )
    ) as Program;
}

export function selectAvailableImportsFromFile(
        state: EastStore,
        program: ESTree.Program,
        visitedFiles: string[] = [],
        calledViaReExport: boolean = false): Array<ImportSpecifier | ImportNamespaceSpecifier> {

    let result: Array<ImportSpecifier | ImportNamespaceSpecifier> = [];

    const exportNamedDeclarations = selectDescendantsByType(state, program, 'ExportNamedDeclaration') as ExportNamedDeclaration[];
    const exportSpecifiers = selectDescendantsByType(state, program, 'ExportSpecifier') as ExportSpecifier[];
    const hasExportDefault = selectDescendantsByType(state, program, 'ExportDefaultDeclaration').length > 0;
    const exportAllDeclarations = selectDescendantsByType(state, program, 'ExportAllDeclaration') as ExportAllDeclaration[];

    const splitProgramPath = program.__east_uid.split('/');
    let programFileName = splitProgramPath[splitProgramPath.length - 1].replace('.js', '');
    programFileName = programFileName.replace(/[-_]/g, '');

    if (hasExportDefault && !calledViaReExport) {
        result = result.concat({
            type: 'ImportSpecifier',
            local: {type: 'Identifier', name: `${programFileName}Default`},
            imported: {type: 'Identifier', name: 'default'}
        });
    }

    if(!calledViaReExport) {
        result = result.concat({
            type: 'ImportNamespaceSpecifier',
            local: {type: 'Identifier', name: `${programFileName}All`}
        });
    }

    result = result.concat(exportNamedDeclarations.reduce((exportSpecifiers, declaration) => {
        if(!declaration.declaration) return exportSpecifiers;
        const identifiers = selectDeclarationIdentifiers(
            state,
            selectASTNodeByTypeAndId(
                state,
                declaration.declaration.type,
                (declaration.declaration as any).uid
            ) as VariableDeclaration
        );
        return exportSpecifiers.concat(identifiers.map(
            identifier => ({
                type: 'ImportSpecifier',
                local: {type: 'Identifier', name: identifier.name},
                imported: {type: 'Identifier', name: identifier.name}
            } as ImportSpecifier)
        ));
    }, []));

    result = result.concat(exportSpecifiers.map(specifier => {

        const exportedName = (selectASTNodeByTypeAndId(
                state,
                specifier.exported.type,
                (specifier.exported as any).uid) as Identifier
        ).name;

        return {
            type: 'ImportSpecifier',
            local: {type: 'Identifier', name: exportedName},
            imported: {type: 'Identifier', name: exportedName}
        } as ImportSpecifier;
    }));

    exportAllDeclarations.forEach(declaration => {
        const resolvedDeclaration = selectASTNodeByTypeAndId(state, declaration.source.type, (declaration.source as any).uid) as any;
        const pathOfExportSource = path.join(path.dirname(program.__east_uid), (resolvedDeclaration as Declaration).value + '.js');
        if (visitedFiles.indexOf(pathOfExportSource) < 0) {
            visitedFiles.push(pathOfExportSource);
            result = result.concat(
                selectAvailableImportsFromFile(
                    state,
                    selectASTNodeByTypeAndId(state, 'Program', pathOfExportSource) as Program,
                    visitedFiles,
                    true
                )
            );
        }
    });

    return result;
}

export function selectDeclarationIdentifiers(state: EastStore, declaration: ESTree.VariableDeclaration | ESTree.FunctionDeclaration | ESTree.ClassDeclaration): ESTree.Identifier[] {
    if(declaration.type === "VariableDeclaration") {
        return declaration.declarations.map(declaration => {
                const declarator = selectASTNodeByTypeAndId(state, declaration.type, (declaration as any).uid) as VariableDeclarator;
                return selectASTNodeByTypeAndId(state, declarator.id.type, (declarator.id as any).uid) as Identifier;
            }
        ); // TODO Implement ObjectPattern, ArrayPattern, RestElement, AssignmentPattern
    } else if(declaration.type === "FunctionDeclaration" || declaration.type === "ClassDeclaration") {
        const identifier = selectASTNodeByTypeAndId(state, declaration.id.type, (declaration.id as any).uid) as Identifier;
        return [identifier];
    }

}

function nou(thing: any): boolean {
    return (thing === null || thing === undefined);
}

