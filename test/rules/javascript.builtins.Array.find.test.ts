import rule, { seed } from "../../src/rules/javascript.builtins.Array.find.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; const found = arr.find(num => num > 1);`,
		"Array.prototype.find.call([1, 2, 3], num => num > 1);",
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
