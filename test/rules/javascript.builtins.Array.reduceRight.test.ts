import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.reduceRight.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3, 4].reduceRight((acc, curr) => acc + curr, 0)`,
		`const numbers = [1, 2, 3, 4, 5]; const concat = numbers.reduceRight((acc, curr) => acc + curr, '');`,
		`const arr = [1, 2, 3, 4]; const product = arr.reduceRight((result, value) => result * value, 1);`,
		"Array.prototype.reduceRight.call([1, 2, 3], (acc, curr) => acc + curr, 0);",
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
