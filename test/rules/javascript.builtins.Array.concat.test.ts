import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.concat.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr1 = [1, 2]; const arr2 = [3, 4]; const combined = arr1.concat(arr2);`,
		`function combineArrays() { return [].concat([1, 2, 3], ['a', 'b']); }`,
		`[].concat([1, 2, 3], ['a', 'b'])`,
		"Array.prototype.concat.call([1, 2], [3, 4])",
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
