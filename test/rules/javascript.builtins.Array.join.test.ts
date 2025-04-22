import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.join.ts";
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
			code: "const arr = [1, 2, 3]; arr.join(',');",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "['a', 'b', 'c'].join('-');",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; arr.join(',');",
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
			code: "['a', 'b', 'c'].join('-');",
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
