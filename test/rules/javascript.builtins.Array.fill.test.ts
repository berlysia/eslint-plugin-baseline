import rule, { seed } from "../../src/rules/javascript.builtins.Array.fill.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.fill(0);`,
		`const arr = new Array(5); arr.fill('a', 1, 3);`,
		`function test(arr: number[]) { return arr.fill(42); }`,
		"Array.prototype.fill.call([1, 2, 3], 0);",
	],
	validOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
