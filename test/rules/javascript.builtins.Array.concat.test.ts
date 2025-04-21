import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.concat.ts";
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
			code: "const arr1 = [1, 2]; const arr2 = [3, 4]; const combined = arr1.concat(arr2);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "function combineArrays() { return [].concat([1, 2, 3], ['a', 'b']); }",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr1 = [1, 2]; const arr2 = [3, 4]; const combined = arr1.concat(arr2);",
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
			code: "[].concat([1, 2, 3], ['a', 'b'])",
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
