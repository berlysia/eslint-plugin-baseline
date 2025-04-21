import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.copyWithin.ts";
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
			// 2025年の広いサポートでは使用可能
			code: "const arr = [1, 2, 3, 4, 5]; arr.copyWithin(0, 3, 4);",
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			// 2019年の広いサポートでも使用可能（2018-03-30以降なので）
			code: "const numbers = [1, 2, 3, 4, 5]; numbers.copyWithin(0, 3);",
			options: [{ asOf: "2019-01-01", support: "widely" }],
		},
		{
			// 2016年の新しいサポートでは使用可能（2015-09-30以降なので）
			code: "const data = new Array(5).fill(1); data.copyWithin(2, 0, 2);",
			options: [{ asOf: "2016-01-01", support: "newly" }],
		},
	],
	invalid: [
		{
			// 2018年初めの広いサポートでは使用不可（widelyAvailableAtは2018-03-30なので）
			code: "const arr = [1, 2, 3, 4, 5]; arr.copyWithin(0, 3, 4);",
			options: [{ asOf: "2018-01-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2018-01-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			// 2015年前半の新しいサポートでも使用不可（newlyAvailableAtは2015-09-30なので）
			code: "const numbers = [1, 2, 3, 4, 5]; numbers.copyWithin(-2, 0);",
			options: [{ asOf: "2015-06-01", support: "newly" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2015-06-01",
						support: "newly",
					}).notAvailable,
				},
			],
		},
		{
			// メソッドチェーンのケース
			code: "[1, 2, 3, 4].slice(1).copyWithin(0, 1, 2);",
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
