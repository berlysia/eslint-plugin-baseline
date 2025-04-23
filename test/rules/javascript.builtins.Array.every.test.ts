import rule, { seed } from "../../src/rules/javascript.builtins.Array.every.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; const allPositive = arr.every(num => num > 0);`,
		`
		function validateAllItems(items: number[]) {
			return items.every(item => item > 0);
		}
			`,
		"Array.prototype.every.call([1, 2, 3], num => num > 0);",
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
