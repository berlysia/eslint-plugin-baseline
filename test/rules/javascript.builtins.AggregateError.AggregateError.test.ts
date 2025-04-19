import "./init.ts";
import { RuleTester } from "eslint";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.AggregateError.ts";
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
			code: "new AggregateError([new Error('error')], 'message')",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "new AggregateError([new Error('error')])",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "new AggregateError([], 'empty')",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "new AggregateError([new Error('error')], 'message')",
			options: [{ asOf: "2017-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2017-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			code: "new AggregateError([], 'empty')",
			options: [{ asOf: "2017-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2017-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
