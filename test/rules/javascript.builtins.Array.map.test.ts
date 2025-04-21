
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.map.ts";
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
			code: "[1, 2, 3].map(x => x * 2)",
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const arr = [1, 2, 3]; arr.map(num => num.toString())",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "[1, 2, 3].map(x => x * 2)",
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
			code: "const myArray = [4, 5, 6]; myArray.map(n => n + 1)",
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
