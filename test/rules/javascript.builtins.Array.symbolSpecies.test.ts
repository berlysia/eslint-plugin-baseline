import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.symbolSpecies.ts";
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
			code: `
        // 新しい日付での有効な使用例
        class MyArray extends Array {
          static get [Symbol.species]() { return Array; }
        }
      `,
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
		{
			code: `
        // 別の有効な使用例 - 直接アクセス
        console.log(Array[Symbol.species]);
      `,
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
		{
			code: `
        // Array継承クラス内でのコンストラクタ使用（内部的にSymbol.speciesを使用）
        class MyArray extends Array {
          filter(callback) {
            return new this.constructor(super.filter(callback));
          }
        }
      `,
			options: [{ asOf: "2023-01-01", support: "widely" }],
		},
	],
	invalid: [
		{
			code: `
        // 古い日付での使用例 - クラス定義内
        class MyArray extends Array {
          static get [Symbol.species]() { return Array; }
        }
      `,
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
			code: `
        // 別の古い日付での使用例 - 直接アクセス
        console.log(Array[Symbol.species]);
      `,
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
			code: `
        // Array継承クラス内でのコンストラクタ使用（内部的にSymbol.speciesを使用）
        class MyArray extends Array {
          filter(callback) {
            return new this.constructor(super.filter(callback));
          }
        }
      `,
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
