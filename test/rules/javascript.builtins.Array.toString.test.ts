import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.toString.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// Basic usage with array literal
		"const arr = [1, 2, 3]; const str = arr.toString();",

		// Usage with empty array
		"const emptyArr = []; const str = emptyArr.toString();",

		// Usage with new Array()
		"const myArray = new Array(3); const str = myArray.toString();",

		// Explicit method call via prototype
		"Array.prototype.toString.call([1, 2, 3]);",

		// Using it in a string concatenation
		"const arr = [1, 2, 3]; const str = 'Array: ' + arr.toString();",

		// Chaining with other methods
		"const arr = [1, 2, 3]; const str = arr.slice(1).toString();",
	],
	validOnlyCodes: [
		// Regular string coercion (implicit toString)
		"const arr = [1, 2, 3]; const str = '' + arr;",

		// Non-Array object with toString method
		"const obj = { toString: () => 'custom string' }; obj.toString();",
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
