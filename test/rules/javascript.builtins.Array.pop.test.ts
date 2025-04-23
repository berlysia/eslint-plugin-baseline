import rule, { seed } from "../../src/rules/javascript.builtins.Array.pop.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.pop();`,
		`const arr: Array<number> = []; arr.pop();`,
		`const arr: number[] = [1]; arr.pop();`,
		`const arr: Array<string> = ['a', 'b']; arr.pop();`,
		"Array.prototype.pop.call([1, 2, 3]);",
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
