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
		// apply/callによる呼び出し
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize.call(buffer, 15);",
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize.apply(buffer, [15]);",
		// 引数なしでの呼び出し（エラーになる可能性があるが構文的には有効）
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer.resize();",
		// 変数に格納した関数の呼び出し
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const resizeFn = buffer.resize; resizeFn.call(buffer, 15);",
		// 条件判定内でのresizeメソッド利用
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); if (buffer.resizable) { buffer.resize(15); }",
	],
	validOnlyCodes: [
		// 非対象オブジェクトの類似メソッド
		"const customObj = { resize: (size) => console.log(size) }; customObj.resize(100);",
		// 非対象の変数名
		"const resize = (size) => size * 2; resize(10);",
		// 計算プロパティによるメソッド呼び出し
		'const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); buffer["resize"](15);',
		// 変数経由のメソッド呼び出し
		'const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); const method = "resize"; buffer[method](15);',
		// 複数のArrayBufferの定義（resize呼び出しなし）
		"const buffer1 = new ArrayBuffer(10, { maxByteLength: 20 }); const buffer2 = new ArrayBuffer(5, { maxByteLength: 30 });",
		// 関数内でのresize呼び出し
		"function resizeBuffer(buf, newSize) { if (buf.resizable) { buf.resize(newSize); } } const buffer = new ArrayBuffer(10, { maxByteLength: 20 }); resizeBuffer(buffer, 15);",
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
