import { join } from "path";
import { getFirstOfTypeInFile } from "../../utils/test-utils";
import { ProgramModel } from "../../reducers/program-ast";
import * as ESTree from 'estree';
import { selectDeclarationIdentifiers } from "../select-ast-node";

describe("select the identifier from a class declarations", () => {

    it("selects direct identifier from a simple class declaration", () => {
        const { state, node } = getFirstOfTypeInFile<ESTree.ClassDeclaration>(
            join(process.cwd(), './fixtures/class-declaration-simple.js'),
            "ClassDeclaration"
        );
        const result = selectDeclarationIdentifiers(state, node);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Test");
    });
});