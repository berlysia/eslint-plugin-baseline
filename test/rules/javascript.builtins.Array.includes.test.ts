import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.includes.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3].includes(2);`,
		"Array.prototype.includes.call([1, 2, 3], 2);",
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
