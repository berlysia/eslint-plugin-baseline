import "./utils/init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import type { InvalidTestCase } from "@typescript-eslint/rule-tester";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.symbolIterator.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";
import type { MessageIds, RuleOptions } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester();

// テストケースの作成
tester.run(seed.concern, rule, {
	// 正常系: ターゲット日付が機能のサポート日より後の場合は警告を出さない
	valid: [
		{
			code: `
        // このテストはターゲット日が十分新しいと仮定
        const arr = [1, 2, 3];
        const iterator = arr[Symbol.iterator]();
        console.log(iterator.next());
      `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: `
        // このテストはターゲット日が十分新しいと仮定
        const arr = [1, 2, 3];
        for (const item of arr) {
          console.log(item);
        }
      `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: `
        // このテストはターゲット日が十分新しいと仮定
        const arr = [1, 2, 3];
        const newArr = [...arr];
      `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
		{
			code: `
        // このテストはターゲット日が十分新しいと仮定
        const arr = [1, 2, 3];
        const [a, b, c] = arr;
      `,
			options: [{ asOf: "2025-01-01", support: "widely" }],
		},
	],
	// 異常系: ターゲット日付が機能のサポート日より前の場合は警告を出す
	invalid: [
		`
        // このテストはターゲット日が古いと仮定
        const arr = [1, 2, 3];
        const iterator = arr[Symbol.iterator]();
        console.log(iterator.next());
      `,
		`
        // このテストはターゲット日が古いと仮定
        const arr = [1, 2, 3];
        for (const item of arr) {
          console.log(item);
        }
      `,
		`
        // このテストはターゲット日が古いと仮定
        const arr = [1, 2, 3];
        const newArr = [...arr];
      `,
		`
        // このテストはターゲット日が古いと仮定
        const arr = [1, 2, 3];
        const [a, b, c] = arr;
      `,
	].map<InvalidTestCase<MessageIds, RuleOptions>>((code) => ({
		code,
		options: [{ asOf: "2015-01-01", support: "newly" }],
		errors: [
			{
				messageId: "notAvailable",
				data: createMessageData(seed, {
					asOf: "2015-01-01",
					support: "newly",
				}).notAvailable,
			},
		],
	})),
});
