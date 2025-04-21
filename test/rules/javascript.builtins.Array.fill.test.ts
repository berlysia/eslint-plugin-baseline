
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.fill.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester({
	languageOptions: {
		parserOptions: {
			projectService: {
				allowDefaultProject: ["*.ts*"],
			},
			tsconfigRootDir: process.cwd(),
		},
	},
});

tester.run(seed.concern, rule, {
	valid: [
		{
			code: "const arr = [1, 2, 3]; arr.fill(0);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const arr = new Array(5); arr.fill('a', 1, 3);",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
		{
			code: "function test(arr: number[]) { return arr.fill(42); }",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; arr.fill(0);",
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
			code: "const arr = new Array(5); arr.fill('a', 1, 3);",
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
