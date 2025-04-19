import { RuleTester } from "eslint";
import rule from "../../src/rules/javascript.builtins.AggregateError.errors.ts";

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: "module",
	},
});

tester.run("javascript.builtins.AggregateError.errors", rule, {
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
					data: {
						asOf: "2020-01-01",
						support: "widely",
					},
				},
			],
		},
		{
			code: "const err = new AggregateError([]); const errors = err.errors;",
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: {
						asOf: "2020-01-01",
						support: "widely",
					},
				},
			],
		},
	],
});
