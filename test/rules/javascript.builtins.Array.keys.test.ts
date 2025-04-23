import rule, { seed } from "../../src/rules/javascript.builtins.Array.keys.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const array = [1, 2, 3]; const iterator = array.keys();`,
		`const myArray = ['a', 'b', 'c']; const keys = myArray.keys(); for (const key of keys) { console.log(key); }`,
		`const myArray = ['a', 'b', 'c']; const keys = myArray.keys();`,
		"Array.prototype.keys.call(['a', 'b', 'c']);",
	],
	validOption: {
		asOf: "2019-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
