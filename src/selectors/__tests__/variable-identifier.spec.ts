import { join } from "path";
import { getFirstOfTypeInFile } from "../../utils/test-utils";
import * as ESTree from 'estree';
import { selectDeclarationIdentifiers } from "../select-ast-node";

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

    it("selects one identifier from a let declaration with an array destructuring pattern", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-arraypattern-simple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("a");
    });

    it("selects two identifiers from a let declaration with an array destructuring pattern", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-arraypattern-multiple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("a");
        expect(result[1].name).toBe("b");
    });

    it("selects two identifiers from a let declaration with a nested array destructuring pattern", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-arraypattern-nested.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("a");
        expect(result[1].name).toBe("b");
    });

    it("selects two identifiers from a let declaration with an array destructuring pattern plus rest param", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-arraypattern-restelement.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("a");
        expect(result[1].name).toBe("rest");
    });

    it("selects one identifier from a let declaration with an object destructuring pattern", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-objectpattern-simple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("a");
    });

    it("selects two identifiers from a let declaration with an object destructuring pattern", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-objectpattern-multiple.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("a");
        expect(result[1].name).toBe("c");
    });

    it("selects two identifiers from a let declaration with a nested object destructuring pattern", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-objectpattern-nested.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("aa");
        expect(result[1].name).toBe("c");
    });

    // FIXME: Unskip this test, once esprima 5 is released with object rest spread support.
    it.skip("selects two identifiers from a let declaration with an object destructuring pattern plus rest param", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.VariableDeclaration>(
            join(process.cwd(), './fixtures/variable-declaration-objectpattern-restelement.js'),
            "VariableDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe("a");
        expect(result[1].name).toBe("other");
    });
});