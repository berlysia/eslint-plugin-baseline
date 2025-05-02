import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.toSpliced.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"const arr = [1, 2, 3]; const newArr = arr.toSpliced(1, 1, 4);",
		"const arr = [1, 2, 3]; const newArr = arr.toSpliced(1, 1);",
		"const arr = [1, 2, 3]; arr.toSpliced(0, 0, 0);",
		"const arr = new Array(3); arr.toSpliced(0, 1, 'a', 'b');",
		"Array.prototype.toSpliced.call([1, 2, 3], 0, 1);",
	],
	validOnlyCodes: [
		// 従来の配列操作メソッド
		"const arr = [1, 2, 3]; arr.splice(1, 1, 4);",
		"const arr = [1, 2, 3]; const newArr = arr.slice(1);",
		// 対象外オブジェクトでの同名メソッド
		"const obj = { toSpliced: (start, count, item) => [item] }; obj.toSpliced(0, 1, 'a');",
	],
	validOption: {
		asOf: "2025-01-01",
		support: "newly",
	},
	invalidOption: {
		asOf: "2022-01-01",
		support: "newly",
	},
});
