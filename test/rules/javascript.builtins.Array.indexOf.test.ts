import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.indexOf.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3].indexOf(2);`,
		"Array.prototype.indexOf.call([1, 2, 3], 2);",
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2016-01-01",
		support: "widely",
	},
});
