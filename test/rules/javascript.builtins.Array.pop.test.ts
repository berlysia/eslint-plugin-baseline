import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.pop.ts";
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
			code: "const arr = [1, 2, 3]; arr.pop();",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const arr: Array<number> = []; arr.pop();",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const arr: number[] = [1]; arr.pop();",
			options: [{ asOf: "2018-01-30", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; arr.pop();",
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
			code: "const arr: Array<string> = ['a', 'b']; arr.pop();",
			options: [{ asOf: "2016-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2016-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
