import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.at.ts";
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
			code: "const arr = [1, 2, 3]; arr[0];", // 古い配列アクセス方法は問題なし
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const arr = [1, 2, 3]; const item = arr.at(0);", // Array.atの使用 - 新しい日付では有効
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const arr = [1, 2, 3]; const last = arr.at(-1);", // 負のインデックスによるアクセス
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: "const obj = { at: (index) => 'value' }; obj.at(0);", // Arrayではないオブジェクトのatメソッドは問題なし
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = [1, 2, 3]; const item = arr.at(0);", // Array.atの使用 - 古い日付では無効
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
			code: "const arr = [1, 2, 3]; const last = arr.at(-1);", // 負のインデックスによるアクセス - 古い日付では無効
			options: [{ asOf: "2021-06-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2021-06-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
		{
			code: "const myArray = new Array(10); const item = myArray.at(5);", // 他の配列形式でも検出
			options: [{ asOf: "2021-06-01", support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: "2021-06-01",
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
