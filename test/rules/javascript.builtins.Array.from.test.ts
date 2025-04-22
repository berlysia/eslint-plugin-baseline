import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.from.ts";
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
			code: "const arr = [1, 2, 3];", // 普通の配列宣言は問題なし
			options: [{ asOf: "2015-01-01", support: "widely" }],
		},
		{
			code: "const arr = Array.from('hello');", // Array.fromの使用 - 新しい日付では有効
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const set = new Set([1, 2, 3]); const arr = Array.from(set);", // Setからの変換
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const obj = { from: (iterable) => [] }; obj.from([]);", // Arrayではないオブジェクトのfromメソッドは問題なし
			options: [{ asOf: "2015-01-01", support: "widely" }],
		},
		{
			code: "class MyArray { static from() {} } MyArray.from();", // カスタムクラスでのfromは問題なし
			options: [{ asOf: "2015-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = Array.from('hello');", // Array.fromの使用 - 古い日付では無効
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
		{
			code: "const set = new Set([1, 2, 3]); const arr = Array.from(set);", // Setからの変換 - 古い日付では無効
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
		{
			code: "function createArray() { return Array.from(arguments); }", // argumentsからの変換 - 古い日付では無効
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
		{
			code: "const arr = Array.from([1, 2, 3], x => x * 2);", // マッピング関数を使用 - 古い日付では無効
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
