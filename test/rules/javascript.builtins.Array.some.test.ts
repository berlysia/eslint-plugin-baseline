import rule, { seed } from "../../src/rules/javascript.builtins.Array.some.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3].some(x => x > 2)`,
		`const arr = ['a', 'b', 'c']; arr.some(item => item === 'b')`,
		`const nums: number[] = [1, 2, 3]; nums.some(num => num % 2 === 0)`,
		`const arr = [1, 2, 3]; arr.some(predicate)`,
		`new Array(5).some((_, i) => i > 3)`,
		"Array.prototype.some.call([1, 2, 3], num => num > 2);",
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
