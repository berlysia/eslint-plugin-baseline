import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.findLast.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; const found = arr.findLast(num => num > 1);`,
		"Array.prototype.findLast.call([1, 2, 3], num => num > 1);",
	],
	validOption: {
		asOf: "2025-03-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
});
