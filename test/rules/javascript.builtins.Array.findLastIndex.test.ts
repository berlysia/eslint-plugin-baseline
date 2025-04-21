
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.findLastIndex.ts";
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
			code: "const arr = [1, 2, 3]; const index = arr.findLastIndex(num => num > 1);",
			options: [{ asOf: "2025-03-01", support: "widely" }],
		},
		{
			code: "const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]; const index = users.findLastIndex(u => u.id === 2);",
			options: [{ asOf: "2025-03-01", support: "widely" }],
		},
		{
			code: "function findLastOccurrenceIndex(arr, predicate) { return arr.findLastIndex(predicate); }",
			options: [{ asOf: "2025-03-15", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; const index = arr.findLastIndex(num => num > 1);",
			options: [{ asOf: "2020-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2020-01-01", 
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			code: "const users = [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]; const index = users.findLastIndex(u => u.id === 2);",
			options: [{ asOf: "2022-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2022-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
