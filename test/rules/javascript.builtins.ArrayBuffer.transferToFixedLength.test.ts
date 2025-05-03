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
		// prototype経由のメソッド取り出しと呼び出し
		"const obj = new ArrayBuffer(); ArrayBuffer.prototype.transferToFixedLength.call(obj);",
		// destructuringによる呼び出し
		"const obj = new ArrayBuffer(); const { transferToFixedLength } = obj; transferToFixedLength();",
		// リテラル指定でのdestructuringによる呼び出し
		"const obj = new ArrayBuffer(); const { [\"transferToFixedLength\"]: renamed } = obj; renamed();",
		// 変数に格納したメソッドの呼び出し
		"const obj = new ArrayBuffer(); const method = obj.transferToFixedLength; method.call(obj);",
		// 関数内での呼び出し - 引数に型注釈を追加
		"function transferBuffer(buf: ArrayBuffer) { return buf.transferToFixedLength(); } const obj = new ArrayBuffer(); transferBuffer(obj);",
	],
	// より複雑なケースもテスト
	validOnlyCodes: [
		// 非対象オブジェクトの類似メソッド (検出されないべき)
		"const customObj = { transferToFixedLength: () => {} }; customObj.transferToFixedLength();",
	],
	validOption: {
		asOf: "2024-03-06",
		support: "newly",
	},
	invalidOption: {
		asOf: "2024-03-04",
		support: "newly",
	},
});