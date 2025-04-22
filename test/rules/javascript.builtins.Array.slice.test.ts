import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.slice.ts";
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
			code: "const arr = [1, 2, 3]; arr.slice(1, 3);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "Array.prototype.slice.call([1, 2, 3], 1);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "[].slice.call(arguments);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const slice = Array.prototype.slice; slice.call([1, 2, 3]);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const numbers = [1, 2, 3, 4, 5]; const subArray = numbers.slice(0, 3);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; arr.slice(1, 3);",
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
			code: "Array.prototype.slice.call([1, 2, 3], 1);",
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
			code: "[].slice.call(arguments);",
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
			code: "const slice = Array.prototype.slice; slice.call([1, 2, 3]);",
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
			code: "const numbers = [1, 2, 3, 4, 5]; const subArray = numbers.slice(0, 3);",
			options: [{ asOf: "2014-01-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2014-01-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
	],
});
