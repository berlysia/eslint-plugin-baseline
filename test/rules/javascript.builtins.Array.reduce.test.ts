import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.reduce.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3, 4].reduce((acc, curr) => acc + curr, 0)`,
		`const numbers = [1, 2, 3, 4, 5]; const sum = numbers.reduce((total, num) => total + num, 0);`,
		`const arr = [1, 2, 3, 4]; const product = arr.reduce((result, value) => result * value, 1);`,
		"Array.prototype.reduce.call([1, 2, 3, 4], (acc, curr) => acc + curr, 0);",
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
