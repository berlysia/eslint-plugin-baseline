
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.indexOf.ts";
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
			// Array.indexOf is widely available as of 2025
			code: "[1, 2, 3].indexOf(2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// Array variable using indexOf method
			code: "const arr = [1, 2, 3]; arr.indexOf(2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// String indexOf usage (not array)
			code: "const str = 'hello'; str.indexOf('e');",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			// Array.indexOf is available as of 2020 (after 2018-01-29 widely available date)
			code: "[1, 2, 3].indexOf(2);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			// Array.indexOf is not widely available as of 2016-01-01 
			// (before 2018-01-29 widely available date)
			code: "[1, 2, 3].indexOf(2);",
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
			// Array variable using indexOf method (not widely available in 2016)
			code: "const arr = [1, 2, 3]; arr.indexOf(2);",
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
			// Array.indexOf with different arguments
			code: "const arr = [1, 2, 3]; arr.indexOf(2, 1);",
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
			// Array.indexOf is not newly available as of 2014-01-01
			// (before 2015-07-29 newly available date)
			code: "[1, 2, 3].indexOf(2);",
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
