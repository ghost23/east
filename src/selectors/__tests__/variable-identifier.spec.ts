import { join } from "path";
import {buildEastStoreMock, getFirstOfTypeInFile, importTestJavaScriptModule} from "../../utils/test-utils";
import {ProgramModel} from "../../reducers/program-ast";
import * as ESTree from 'estree';
import {
    selectASTNodeByTypeAndId, selectDescendantsByType, selectEntryFile, selectEntryFileProgramNode,
    selectDeclarationIdentifiers
} from "../select-ast-node";
import {EastStore} from "../../reducers/reducers";

describe("select identifiers from variable declarations", () => {

    it("selects direct identifier from a simple let declaration", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-simple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("test");
    });

    it("selects direct identifiers from a let declaration with multiple declarators", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-multiple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("test");
        expect(result[1].name).toBe("other");
    });

    it("selects direct identifiers from a let declaration with multiple declarators", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-multiple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("test");
        expect(result[1].name).toBe("other");
    });

    //TODO Implement tests for FunctionDeclaration and ClassDeclaration
});