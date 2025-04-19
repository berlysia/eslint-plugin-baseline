import { RuleTester } from "eslint";
import rule from "../../src/rules/javascript.builtins.AggregateError.ts";

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: "module",
	},
});

tester.run("javascript.builtins.AggregateError", rule, {
	valid: [
		{
			code: "new AggregateError([new Error('error')], 'message')",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "new AggregateError([new Error('error')])",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "new AggregateError([new Error('error')], 'message')",
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
