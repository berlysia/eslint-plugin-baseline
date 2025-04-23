import rule, { seed } from "../../src/rules/javascript.builtins.Array.push.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.push(4);`,
		`const myArray = []; myArray.push('item');`,
		`const items = ['a', 'b']; items.push('c', 'd');`,
		"Array.prototype.push.call([1, 2, 3], 4);",
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
