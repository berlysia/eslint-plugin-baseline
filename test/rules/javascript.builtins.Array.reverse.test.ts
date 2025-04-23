import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.reverse.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.reverse();`,
		"Array.prototype.reverse.call([1, 2, 3]);",
	],
	validOnlyCodes: [`const obj = { reverse: () => {} }; obj.reverse();`],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
