
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.lastIndexOf.ts";
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
			// Array.lastIndexOf is widely available as of 2025
			code: "[1, 2, 3, 2].lastIndexOf(2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// Array variable using lastIndexOf method
			code: "const arr = [1, 2, 3, 2]; arr.lastIndexOf(2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// String lastIndexOf usage (not array)
			code: "const str = 'hello'; str.lastIndexOf('l');",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			// Array.lastIndexOf is available as of 2020 (after 2018-01-29 widely available date)
			code: "[1, 2, 3, 2].lastIndexOf(2);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			// Array.lastIndexOf is not widely available as of 2016-01-01 
			// (before 2018-01-29 widely available date)
			code: "[1, 2, 3, 2].lastIndexOf(2);",
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
			// Array variable using lastIndexOf method (not widely available in 2016)
			code: "const arr = [1, 2, 3, 2]; arr.lastIndexOf(2);",
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
			// Array.lastIndexOf with different arguments
			code: "const arr = [1, 2, 3, 2]; arr.lastIndexOf(2, 1);",
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
			// Array.lastIndexOf is not newly available as of 2014-01-01
			// (before 2015-07-29 newly available date)
			code: "[1, 2, 3, 2].lastIndexOf(2);",
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
