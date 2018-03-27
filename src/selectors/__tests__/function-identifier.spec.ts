import { join } from "path";
import { getFirstOfTypeInFile } from "../../utils/test-utils";
import { ProgramModel } from "../../reducers/program-ast";
import * as ESTree from 'estree';
import { selectDeclarationIdentifiers } from "../select-ast-node";

describe("select the identifier from a function declarations", () => {

    it("selects direct identifier from a simple function declaration", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.FunctionDeclaration>(
            join(process.cwd(), './fixtures/function-declaration-simple.js'),
            "FunctionDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("test");
    });
});