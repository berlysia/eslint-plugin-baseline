import rule, { seed } from "../../src/rules/javascript.builtins.Array.flat.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, [2, 3]]; const flattened = arr.flat();`,
		`const arr = [1, [2, 3]]; arr.flat();`,
		"Array.prototype.flat.call([1, [2, 3]]);",
	],
	validOption: {
		asOf: "2023-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2020-02-01",
		support: "widely",
	},
});
