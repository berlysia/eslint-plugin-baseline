import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.toSorted.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const sortedArr = arr.toSorted();", // 基本的な使用方法
		"const arr = [3, 1, 2]; const sortedArr = arr.toSorted((a, b) => a - b);", // コンパレータ関数を使用
		"const arr = ['c', 'a', 'b']; const sortedArr = arr.toSorted();", // 文字列配列ソート
		"const myArray = new Array(3, 1, 2); const sortedArr = myArray.toSorted();", // 他の配列形式での使用
		"Array.prototype.toSorted.call([3, 1, 2]);", // 明示的なメソッド呼び出し
	],
	validOnlyCodes: [
		"const arr = [1, 2, 3]; arr.sort();", // 古い配列ソートメソッド
		"const obj = { toSorted: () => [] }; obj.toSorted();", // ArrayではないオブジェクトのtoSortedメソッド
	],
	validOption: {
		asOf: "2023-07-06",
		support: "newly",
	},
	invalidOption: {
		asOf: "2023-01-01", // Before 2023-07-04 when the method became available
		support: "widely",
	},
});
