import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.findIndex.ts";
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
			code: "const arr = [1, 2, 3]; const index = arr.findIndex(num => num > 1);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]; const userIndex = users.findIndex(u => u.id === 2);",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
		{
			code: "function findIndexInArray(arr, predicate) { return arr.findIndex(predicate); }",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; const index = arr.findIndex(num => num > 1);",
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
			code: "const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]; const userIndex = users.findIndex(u => u.id === 2);",
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
