import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.flat.ts";
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
			// Array.flat is widely available after July 2022
			code: "const arr = [1, [2, 3]]; const flattened = arr.flat();",
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
		{
			// Array.flat with depth parameter
			code: "const arr = [1, [2, [3, 4]]]; const flattened = arr.flat(2);",
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
		{
			// Array.flat is newly available after January 2020
			code: "const nestedArray = [[1, 2], [3, 4]]; nestedArray.flat();",
			options: [{ asOf: "2021-01-01", support: "newly" }],
		},
	],
	invalid: [
		{
			// Array.flat isn't widely available before July 2022
			code: "const arr = [1, [2, 3]]; arr.flat();",
			options: [{ asOf: "2020-02-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-02-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			// Array.flat isn't newly available before January 2020
			code: "const arr = [1, [2, 3]]; const flattened = arr.flat();",
			options: [{ asOf: "2019-01-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2019-01-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
		{
			// Array.flat with depth parameter isn't available before 2020
			code: "const deepArray = [1, [2, [3, 4]]]; deepArray.flat(2);",
			options: [{ asOf: "2019-01-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2019-01-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
	],
});
