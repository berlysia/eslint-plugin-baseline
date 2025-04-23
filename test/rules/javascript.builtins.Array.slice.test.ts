import rule, { seed } from "../../src/rules/javascript.builtins.Array.slice.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.slice(1, 3);`,
		`Array.prototype.slice.call([1, 2, 3], 1);`,
		`[].slice.call(arguments);`,
		`const slice = Array.prototype.slice; slice.call([1, 2, 3]);`,
		`const numbers = [1, 2, 3, 4, 5]; const subArray = numbers.slice(0, 3);`,
		"Array.prototype.slice.call([1, 2, 3], 1, 2);",
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
