import rule, { seed } from "../../src/rules/javascript.builtins.Array.sort.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [3, 1, 2]; arr.sort();",
		"[5, 1, 4, 2, 3].sort((a, b) => a - b);",
		"const sortedArray = [1, 2, 3].filter(x => x > 0).sort();",
		"new Array(5).fill(0).sort();",
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
