import { RuleTester } from "eslint";
import rule from "../../src/rules/javascript.statements.async_function.ts";

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: "module",
	},
});

ruleTester.run("baseline-features", rule, {
	valid: [
		{
			code: "async function foo() {}",
			options: [
				{
					asOf: "2024-01-01",
					support: "widely",
				},
			],
		},
	],
	invalid: [
		{
			code: "async function foo() {}",
			options: [
				{
					asOf: "2017-01-01",
					support: "widely",
				},
			],
			errors: [
				{
					messageId: "notAvailable",
					data: {
						asOf: "2017-01-01",
						support: "widely",
					},
				},
			],
		},
	],
});
