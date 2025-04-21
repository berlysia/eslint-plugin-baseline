
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.length.ts";
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
			// Array.length is widely available as of 2025
			code: "const arr = [1, 2, 3]; console.log(arr.length);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// Array literal length property access
			code: "[1, 2, 3].length;",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// String length property access (not array)
			code: "const str = 'hello'; str.length;",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			// Array.length is available as of 2020 (after 2018-01-29 widely available date)
			code: "const arr = [1, 2, 3]; arr.length;",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			// Array.length is not widely available as of 2016-01-01 
			// (before 2018-01-29 widely available date)
			code: "const arr = [1, 2, 3]; console.log(arr.length);",
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
		{
			// Array literal length property access (not widely available in 2016)
			code: "[1, 2, 3].length;",
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
		{
			// Using length property with other array operations
			code: "const arr = [1, 2, 3]; const len = arr.length; arr[len - 1];",
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
		{
			// Array.length is not newly available as of 2014-01-01
			// (before 2015-07-29 newly available date)
			code: "const arr = []; arr.length;",
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
