import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.symbolUnscopables.ts";
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
			code: "const unscopablesValue = Array.prototype[Symbol.unscopables];",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const arrayProto = Array.prototype; const unscopables = arrayProto[Symbol.unscopables];",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const unscopablesValue = Array.prototype[Symbol.unscopables];",
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
			code: "function testSymbolUnscopables() { const arr = []; return arr[Symbol.unscopables]; }",
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
