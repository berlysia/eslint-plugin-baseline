import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.length.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [`const arr = [1, 2, 3]; console.log(arr.length);`],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2016-01-01",
		support: "widely",
	},
});
