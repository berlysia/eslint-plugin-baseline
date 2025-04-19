import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.AggregateError.serializable_object.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2024,
		sourceType: "module",
		parserOptions: {
			projectService: {
				allowDefaultProject: ["*.ts*"],
			},
			tsconfigRootDir: process.cwd(),
		},
	},
});

tester.run("javascript.builtins.AggregateError.serializable_object", rule, {
	valid: [
		{
			code: "JSON.stringify({ error: new AggregateError([new Error('error')]) })",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "JSON.stringify(new AggregateError([new Error('error')]))",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "JSON.stringify([new AggregateError([])])",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "JSON.stringify({ error: new AggregateError([new Error('error')]) })",
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
			code: "JSON.stringify(new AggregateError([]))",
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
