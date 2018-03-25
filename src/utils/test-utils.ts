import {importJavaScript} from "../main/importer/import-javascript";
import {ProgramModel} from "../reducers/program-ast";
import {EastStore} from "../reducers/reducers";
import {VIEW_MODES} from "./constants";
import {
    selectDescendantsByType, selectEntryFileProgramNode,
    selectDeclarationIdentifiers
} from "../selectors/select-ast-node";
import * as ESTree from "estree";

export function importTestJavaScriptModule(fileURI: string): ProgramModel {
    let programModel: ProgramModel;
    let importResult = importJavaScript(fileURI);
    programModel = {
        astMap: importResult.syntaxMap,
        importedFiles: new Set<string>(importResult.importedFiles),
        entryFile: fileURI,
        importError: null
    };
    return programModel;
}

export function buildEastStoreMock(
    programModel: ProgramModel = { astMap: {}, importedFiles: new Set<string>(), entryFile: null, importError: null }): EastStore {
    return {
        programModel,
        viewMode: { currentView: VIEW_MODES.TEXTUAL_VIEW }
    }
}

export function getFirstOfTypeInFile<P extends ESTree.Node>(fileURI: string, type: string): {state: EastStore, node: P} {
    const model: ProgramModel = importTestJavaScriptModule(fileURI);
    const state: EastStore = buildEastStoreMock(model);
    const result = selectDescendantsByType(
        state,
        selectEntryFileProgramNode(state),
        type
    )[0] as P;
    return {state, node: result};
}