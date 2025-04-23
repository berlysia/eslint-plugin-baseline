import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.entries.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; const iterator = arr.entries();`,
		`class MyArray extends Array { testMethod() { return this.entries(); } }`,
		`function processArray(arr: number[]) { for (const [index, element] of arr.entries()) { console.log(index, element); } }`,
		"Array.prototype.entries.call([1, 2, 3]);",
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
