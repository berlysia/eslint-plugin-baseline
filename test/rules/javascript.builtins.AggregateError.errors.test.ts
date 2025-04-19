import "./init.ts";
import { RuleTester } from "eslint";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.errors.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: "module",
	},
});

tester.run(seed.concern, rule, {
	valid: [
		{
			code: "const errors = AggregateError.errors;",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const err = new AggregateError([]); const errors = err.errors;",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const errors = AggregateError.errors;",
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			code: "const err = new AggregateError([]); const errors = err.errors;",
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
