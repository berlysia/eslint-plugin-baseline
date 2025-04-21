import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.fromAsync.ts";
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
			code: "const result = Array.from(asyncIterable);",
			options: [{ asOf: "2017-01-01", support: "widely" }],
		},
		{
			code: "const result = Array.fromAsync(asyncIterable);",
			options: [{ asOf: "2025-01-01", support: "newly" }],
		},
	],
	invalid: [
		{
			code: "const result = Array.fromAsync(asyncIterable);",
			options: [{ asOf: "2023-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2023-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
