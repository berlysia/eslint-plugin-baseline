import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.filter.ts";
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
			code: "const arr = [1, 2, 3]; const filtered = arr.filter(num => num > 1);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const myArray = [10, 20, 30, 40]; const evenNumbers = myArray.filter(num => num % 2 === 0);",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
		{
			code: "function filterArray(arr, predicate) { return arr.filter(predicate); }",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; const filtered = arr.filter(num => num > 1);",
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
			code: "const myArray = [10, 20, 30, 40]; const evenNumbers = myArray.filter(num => num % 2 === 0);",
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
