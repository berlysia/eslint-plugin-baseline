import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.of.ts";
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
			code: "const arr = Array.of(1, 2, 3);", // Array.ofの使用 - 新しい日付では有効
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const arr = Array.of();", // 引数なしのArray.of - 新しい日付では有効
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const arr = Array.of(...[1, 2, 3]);", // スプレッド構文を使用したArray.of - 新しい日付では有効
			options: [{ asOf: "2020-01-01", support: "widely" }],
		},
		{
			code: "const obj = { of: (...args) => [] }; obj.of(1, 2, 3);", // Arrayではないオブジェクトのofメソッドは問題なし
			options: [{ asOf: "2015-01-01", support: "widely" }],
		},
		{
			code: "class MyArray { static of() {} } MyArray.of(1, 2, 3);", // カスタムクラスでのofは問題なし
			options: [{ asOf: "2015-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: "const arr = Array.of(1, 2, 3);", // Array.ofの使用 - 古い日付では無効
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
			code: "const arr = Array.of();", // 引数なしのArray.of - 古い日付では無効
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
			code: "const ArrayAlias = Array; const arr = ArrayAlias.of(1, 2, 3);", // エイリアス経由でのArray.of - 古い日付では無効
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
			code: "function createArray() { return Array.of(...arguments); }", // argumentsとスプレッド演算子を使用 - 古い日付では無効
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
