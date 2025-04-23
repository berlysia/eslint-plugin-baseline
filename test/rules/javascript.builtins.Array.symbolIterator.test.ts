import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.symbolIterator.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`
        // Symbol.iteratorを直接使用
        const arr = [1, 2, 3];
        const iterator = arr[Symbol.iterator]();
        console.log(iterator.next());
      `,
		`
        // for...ofループ（内部的にSymbol.iteratorを使用）
        const arr = [1, 2, 3];
        for (const item of arr) {
          console.log(item);
        }
      `,
		`
        // スプレッド演算子（内部的にSymbol.iteratorを使用）
        const arr = [1, 2, 3];
        const newArr = [...arr];
      `,
		`
        // 分割代入（内部的にSymbol.iteratorを使用）
        const arr = [1, 2, 3];
        const [a, b, c] = arr;
      `,
		"Array.prototype[Symbol.iterator].call(['a', 'b', 'c']);",
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2015-01-01",
		support: "newly",
	},
});
