import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import type { InvalidTestCase } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.serializable_object.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";
import type { MessageIds, RuleOptions } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester();

tester.run("javascript.builtins.AggregateError.serializable_object", rule, {
	valid: [
		{
			code: "JSON.stringify({ error: new AggregateError([new Error('error')]) })",
			options: [{ asOf: "2025-01-01", support: "newly" }],
		},
		{
			code: "JSON.stringify([new AggregateError([])])",
			options: [{ asOf: "2025-01-01", support: "newly" }],
		},
		{
			code: "const x = new AggregateError([]); JSON.stringify([x])",
			options: [{ asOf: "2025-01-01", support: "newly" }],
		},
		{
			code: "class CustomError extends AggregateError {}; const x = new CustomError([]); JSON.stringify([x])",
			options: [{ asOf: "2025-01-01", support: "newly" }],
		},
	],
	invalid: [
		"JSON.stringify({ error: new AggregateError([new Error('error')]) })",
		"JSON.stringify(new AggregateError([]))",
		"const x = new AggregateError([]); JSON.stringify([x])",
		"class CustomError extends AggregateError {}; const x = new CustomError([]); JSON.stringify([x])",
	].map<InvalidTestCase<MessageIds, RuleOptions>>((code) => ({
		code,
		options: [{ asOf: "2020-01-01", support: "newly" }],
		errors: [
			{
				messageId: "notAvailable",
				data: createMessageData(seed, {
					asOf: "2020-01-01",
					support: "newly",
				}).notAvailable,
			},
		],
	})),
});
