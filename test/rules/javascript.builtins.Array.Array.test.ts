import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.Array.Array.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		"new Array();", // 引数なしのコンストラクタ
		"Array();", // 関数形式での呼び出し
		"new Array(1, 2, 3);", // 複数の値で配列を初期化
		"new Array(10);", // 配列サイズを指定して初期化
		"Array(10);", // 関数形式でサイズ指定
	],
	validOption: {
		asOf: "2025-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
