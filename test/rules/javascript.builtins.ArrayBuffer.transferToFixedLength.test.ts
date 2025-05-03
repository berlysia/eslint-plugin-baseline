import "./utils/init.ts";
import rule, { seed } from "../../src/rules/javascript.builtins.ArrayBuffer.transferToFixedLength.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// インスタンスメソッドへの参照
		"const obj = new ArrayBuffer(); obj.transferToFixedLength;",
		// 基本的なインスタンスメソッド呼び出し
		"const obj = new ArrayBuffer(); obj.transferToFixedLength();",
		// 計算プロパティによる呼び出し
		"const obj = new ArrayBuffer(); obj[\"transferToFixedLength\"]();",
		// 変数経由のプロパティアクセス
		"const obj = new ArrayBuffer(); const prop = \"transferToFixedLength\"; obj[prop]();",
	],
	// これらのケースはvalidOnlyCodesではなく、現時点ではテスト対象から除外
	/* 将来対応予定
	codes: [
		...
		// prototype経由のメソッド取り出しと呼び出し
		"const obj = new ArrayBuffer(); ArrayBuffer.prototype.transferToFixedLength.call(obj);",
		// destructuringによる呼び出し
		"const obj = new ArrayBuffer(); const { transferToFixedLength } = obj; transferToFixedLength();",
		// リテラル指定でのdestructuringによる呼び出し
		"const obj = new ArrayBuffer(); const { [\"transferToFixedLength\"]: renamed } = obj; renamed();",
		// 変数経由のdestructuringによる呼び出し
		"const obj = new ArrayBuffer(); const prop = \"transferToFixedLength\"; const { [prop]: renamed } = obj; renamed();",
	],
	*/
	validOption: {
		asOf: "2024-03-06",
		support: "newly",
	},
	invalidOption: {
		asOf: "2024-03-04",
		support: "newly",
	},
});