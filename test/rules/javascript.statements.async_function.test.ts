import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.statements.async_function.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const ruleTester = new RuleTester();

ruleTester.run(seed.concern, rule, {
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
					data: createMessageData(seed, {
						asOf: "2017-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
