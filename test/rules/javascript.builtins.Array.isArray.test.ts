
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.isArray.ts";
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
			code: "Array.isArray([1, 2, 3]);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const arr = [1, 2, 3]; const result = Array.isArray(arr);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "function checkIsArray(value) { return Array.isArray(value); }",
			options: [{ asOf: "2018-01-30", support: "widely" }],
		},
		{
			code: "const isArrayCheck = Array.isArray;",
			options: [{ asOf: "2018-01-30", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "Array.isArray([1, 2, 3]);",
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
			code: "const arr = [1, 2, 3]; const result = Array.isArray(arr);",
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
			code: "function checkIsArray(value) { return Array.isArray(value); }",
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
