import rule, { seed } from "../../src/rules/javascript.builtins.Array.map.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3].map(x => x * 2)`,
		`const arr = [1, 2, 3]; arr.map(num => num.toString())`,
		`const myArray = [4, 5, 6]; myArray.map(n => n + 1)`,
		"Array.prototype.map.call([1, 2, 3], num => num * 2);",
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
