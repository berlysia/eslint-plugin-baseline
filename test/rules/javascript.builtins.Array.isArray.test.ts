import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.isArray.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [`Array.isArray([1, 2, 3]);`, `const isArrayCheck = Array.isArray;`],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
