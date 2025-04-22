import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.reduce.ts";
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
			code: "[1, 2, 3, 4].reduce((acc, curr) => acc + curr, 0)",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const numbers = [1, 2, 3, 4, 5]; const sum = numbers.reduce((total, num) => total + num, 0);",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "[1, 2, 3, 4].reduce((acc, curr) => acc + curr, 0)",
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
			code: "const arr = [1, 2, 3, 4]; const product = arr.reduce((result, value) => result * value, 1);",
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
