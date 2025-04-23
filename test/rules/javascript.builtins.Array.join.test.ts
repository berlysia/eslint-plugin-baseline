import rule, { seed } from "../../src/rules/javascript.builtins.Array.join.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.join(',');`,
		`['a', 'b', 'c'].join('-');`,
		"Array.prototype.join.call(['a', 'b', 'c'], '-');",
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
