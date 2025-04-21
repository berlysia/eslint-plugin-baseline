
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.forEach.ts";
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
			// After the widely available date, forEach usage should be valid
			code: "[1, 2, 3].forEach(item => console.log(item));",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			// Other array methods shouldn't trigger this rule
			code: "[1, 2, 3].map(item => item * 2);",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			// Array.forEach with newly support
			code: "const arr = [1, 2, 3]; arr.forEach(num => console.log(num));",
			options: [{ asOf: "2016-01-01", support: "newly" }],
		},
	],
	invalid: [
		{
			// Before the widely available date, forEach should be invalid with "widely" support
			code: "[1, 2, 3].forEach(item => console.log(item));",
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
			// Before the newly available date, forEach should be invalid with any support level
			code: "const arr = [1, 2, 3]; arr.forEach(num => console.log(num));",
			options: [{ asOf: "2015-01-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2015-01-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
	],
});
