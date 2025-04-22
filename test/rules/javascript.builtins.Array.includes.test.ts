import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.includes.ts";
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
			// Array.includes is widely available as of 2025
			code: "[1, 2, 3].includes(2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// Array variable using includes method
			code: "const arr = [1, 2, 3]; arr.includes(2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// Array-like object with includes from library
			code: "const arr = new Set([1, 2, 3]); // Set doesn't have includes, so this won't trigger our rule",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			// Array.includes is available as of 2020 (after 2019-02-02 widely available date)
			code: "[1, 2, 3].includes(2);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			// Array.includes is not widely available as of 2017-01-01
			// (before 2019-02-02 widely available date)
			code: "[1, 2, 3].includes(2);",
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
			// Array variable using includes method (not widely available in 2017)
			code: "const arr = [1, 2, 3]; arr.includes(2);",
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
			// Array.includes with different arguments
			code: "const arr = [1, 2, 3]; arr.includes(2, 1);",
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
			// Array.includes is not newly available as of 2016-01-01
			// (before 2016-08-02 newly available date)
			code: "[1, 2, 3].includes(2);",
			options: [{ asOf: "2016-01-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2016-01-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
	],
});
