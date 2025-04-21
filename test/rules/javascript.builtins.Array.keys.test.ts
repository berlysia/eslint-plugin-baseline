
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.keys.ts";
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
			code: "const array = [1, 2, 3]; const iterator = array.keys();",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
		{
			code: "const myArray = ['a', 'b', 'c']; const keys = myArray.keys(); for (const key of keys) { console.log(key); }",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const array = [1, 2, 3]; const iterator = array.keys();",
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
			code: "const myArray = ['a', 'b', 'c']; const keys = myArray.keys();",
			options: [{ asOf: "2015-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2015-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
