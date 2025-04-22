import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.Array.ts";
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

// この日付より前ではサポートされていない
const UNSUPPORTED_DATE = "2017-01-01";
// この日付以降では広くサポートされている
const SUPPORTED_DATE = "2025-01-01";

tester.run(seed.concern, rule, {
	valid: [
		// 正常系1: 十分にサポートされている日付での使用
		{
			code: "new Array();",
			options: [{ asOf: SUPPORTED_DATE, support: "widely" }],
		},
		// 正常系2: コンストラクタの関数形式での呼び出し
		{
			code: "Array();",
			options: [{ asOf: SUPPORTED_DATE, support: "widely" }],
		},
		// 正常系3: 複数の値で配列を初期化
		{
			code: "new Array(1, 2, 3);",
			options: [{ asOf: SUPPORTED_DATE, support: "widely" }],
		},
		// 正常系4: 配列サイズを指定して初期化
		{
			code: "new Array(10);",
			options: [{ asOf: SUPPORTED_DATE, support: "widely" }],
		},
	],
	invalid: [
		// 異常系1: サポートされていない日付でのnew Array()の使用
		{
			code: "new Array();",
			options: [{ asOf: UNSUPPORTED_DATE, support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: UNSUPPORTED_DATE,
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 異常系2: サポートされていない日付でのArray()の使用
		{
			code: "Array();",
			options: [{ asOf: UNSUPPORTED_DATE, support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: UNSUPPORTED_DATE,
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 異常系3: 複数の値で初期化
		{
			code: "new Array(1, 2, 3);",
			options: [{ asOf: UNSUPPORTED_DATE, support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: UNSUPPORTED_DATE,
						support: "widely",
					}).notAvailable,
				},
			],
		},
		// 異常系4: 配列サイズを指定して初期化
		{
			code: "Array(10);",
			options: [{ asOf: UNSUPPORTED_DATE, support: "widely" }],
			errors: [
				{
					messageId: "notAvailable",
					data: createMessageData(seed, {
						asOf: UNSUPPORTED_DATE,
						support: "widely",
					}).notAvailable,
				},
			],
		},
	],
});
