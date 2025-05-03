import "./utils/init.ts";
import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.resize.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 基本的なメソッド呼び出し
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize(15);",
		// メソッド参照
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const resizeMethod = buffer.resize;",
		// 引数なしでの呼び出し（エラーになる可能性があるが構文的には有効）
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize();",
		// 条件判定内でのresizeメソッド利用
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); if (buffer.resizable) { buffer.resize(15); }",
		// apply/callによる呼び出し
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize.call(buffer, 15);",
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize.apply(buffer, [15]);",
		// 変数に格納した関数の呼び出し
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const resizeFn = buffer.resize; resizeFn.call(buffer, 15);",
		// 計算プロパティによるメソッド呼び出し
		'const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer["resize"](15);',
		// 変数経由のメソッド呼び出し
		'const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const method = "resize"; buffer[method](15);',
		// destructuringによる呼び出し
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const { resize } = buffer; resize.call(buffer);",
		// 関数内での呼び出し - 引数に型注釈を追加
		"function resizeBuffer(buf: ArrayBuffer, newSize: number) { if (buf.resizable) { buf.resize(newSize); } } const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); resizeBuffer(buffer, 15);",
	],
	validOnlyCodes: [
		// 非対象オブジェクトの類似メソッド (検出されないべき)
		"const customObj = { resize: (size) => console.log(size) }; customObj.resize(100);",
		// 非対象の変数名
		"const resize = (size) => size * 2; resize(10);",
		// 複数のArrayBufferの定義（resize呼び出しなし）
		"const buffer1 = new ArrayBuffer(10, { maxByteLength: 20 }); const buffer2 = new ArrayBuffer(5, { maxByteLength: 30 });",
	],
	validOption: {
		asOf: "2024-07-10",
		support: "newly",
	},
	invalidOption: {
		asOf: "2024-07-08",
		support: "newly",
	},
});
