import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.lastIndexOf.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3, 2].lastIndexOf(2);`,
		"Array.prototype.lastIndexOf.call([1, 2, 3, 2], 2);",
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
