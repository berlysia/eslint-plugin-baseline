import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.unshift.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// Basic usage
		"const arr = [1, 2, 3]; arr.unshift(0);",
		// Adding multiple elements
		"const arr = ['a', 'b', 'c']; arr.unshift('x', 'y', 'z');",
		// Using with new Array()
		"const arr = new Array(); arr.unshift('first');",
		// Using with result (length)
		"const arr = [10, 20]; const newLength = arr.unshift(0);",
		// Explicit prototype call
		"Array.prototype.unshift.call([1, 2, 3], 0);",
		// Using with array literal
		"const newLength = [1, 2, 3].unshift(0);",
	],
	validOnlyCodes: [
		// Non-array object with unshift method (not our concern)
		"const obj = { unshift: (item) => { this.items = [item, ...this.items]; return this.items.length; }, items: [] }; obj.unshift('item');",
		// Using other array methods
		"const arr = [1, 2, 3]; arr.push(4);",
		// Function named unshift (not our concern)
		"function unshift(arr, value) { return [value, ...arr]; }",
	],
	validOption: {
		asOf: "2018-01-30",
		support: "widely",
	},
	invalidOption: {
		asOf: "2018-01-28",
		support: "widely",
	},
});
