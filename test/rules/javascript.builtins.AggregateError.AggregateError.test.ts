import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.AggregateError.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester();

tester.run(seed.concern, rule, {
	valid: [
		{
			code: "new AggregateError([new Error('error')], 'message')",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "class CustomError extends AggregateError {}",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const X = AggregateError; new X()",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const AggregateError = class {}; new AggregateError()",
			options: [{ asOf: "2017-01-01", support: "widely" }],
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
			code: "class CustomError extends AggregateError {}",
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
			code: "const X = AggregateError; new X()",
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
