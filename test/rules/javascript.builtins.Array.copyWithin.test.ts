import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.copyWithin.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3, 4, 5]; arr.copyWithin(0, 3, 4);",
		"const numbers = [1, 2, 3, 4, 5]; numbers.copyWithin(0, 3);",
		"Array.prototype.copyWithin.call([1, 2, 3, 4, 5], 0, 3);",
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2018-01-01",
		support: "widely",
	},
});
