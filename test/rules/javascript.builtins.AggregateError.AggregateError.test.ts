import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.AggregateError.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`new AggregateError([new Error('error')], 'message')`,
		`class CustomError extends AggregateError {}`,
		`const X = AggregateError; new X()`,
	],
	validOnlyCodes: [`const AggregateError = class {}; new AggregateError()`],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
