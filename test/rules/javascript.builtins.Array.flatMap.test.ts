import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.flatMap.ts";
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
			code: "[1, 2, 3].flatMap(x => [x, x * 2])",
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
		{
			code: "const arr = [4, 5, 6]; arr.flatMap(x => [x, x * 2])",
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "[1, 2, 3].flatMap(x => [x, x * 2])",
			options: [{ asOf: "2019-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2019-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			code: "const arr = [4, 5, 6]; arr.flatMap(x => [x, x * 2])",
			options: [{ asOf: "2019-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2019-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
