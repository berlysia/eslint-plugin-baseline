import "./init.ts";
import { RuleTester } from "eslint";
import rule from "../../src/rules/javascript.builtins.AggregateError.serializable_object.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";
import { seed } from "../../src/rules/javascript.statements.async_function.ts";

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: "module",
	},
});

tester.run("javascript.builtins.AggregateError.serializable_object", rule, {
	valid: [
		{
			code: "JSON.stringify({ error: new AggregateError([new Error('error')]) })",
			options: [
				{
					asOf: "2025-01-01",
					support: "widely",
				},
			],
		},
		{
			code: "JSON.stringify(new AggregateError([new Error('error')]))",
			options: [
				{
					asOf: "2025-01-01",
					support: "widely",
				},
			],
		},
		{
			code: "JSON.stringify([new AggregateError([])])",
			options: [
				{
					asOf: "2025-01-01",
					support: "widely",
				},
			],
		},
	],
	invalid: [
		{
			code: "JSON.stringify({ error: new AggregateError([new Error('error')]) })",
			options: [
				{
					asOf: "2020-01-01",
					support: "widely",
				},
			],
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
			code: "JSON.stringify(new AggregateError([]))",
			options: [
				{
					asOf: "2020-01-01",
					support: "widely",
				},
			],
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
