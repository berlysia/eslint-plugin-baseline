import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.fromAsync.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [`const result = Array.fromAsync(asyncIterable);`],
	validOption: {
		asOf: "2025-01-01",
		support: "newly",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
