import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.serializable_object.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`JSON.stringify({ error: new AggregateError([new Error('error')]) })`,
		`JSON.stringify([new AggregateError([])])`,
		`const x = new AggregateError([]); JSON.stringify([x])`,
		`class CustomError extends AggregateError {}; const x = new CustomError([]); JSON.stringify([x])`,
	],
	validOption: {
		asOf: "2025-01-01",
		support: "newly",
	},
	invalidOption: {
		asOf: "2020-01-01",
		support: "newly",
	},
});
