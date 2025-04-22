import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.shift.ts";
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
			code: "const arr = [1, 2, 3]; arr.shift();",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "[1, 2, 3].shift();",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const myArray = []; myArray.shift();",
			options: [{ asOf: "2018-02-01", support: "widely" }],
		},
		{
			code: "function test(): void { const array = [1]; array.shift(); }",
			options: [{ asOf: "2015-07-30", support: "newly" }],
		},
		{
			code: "// Unrelated code that should not trigger\nconst obj = { shift: () => {} }; obj.shift();",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			code: "// Another unrelated code\nfunction shift() {} shift();",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; arr.shift();",
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
			code: "[1, 2, 3].shift();",
			options: [{ asOf: "2015-07-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2015-07-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
		{
			code: "const array = new Array(5); array.shift();",
			options: [{ asOf: "2018-01-15", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2018-01-15",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
