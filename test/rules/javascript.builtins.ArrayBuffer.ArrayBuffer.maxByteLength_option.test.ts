import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.ArrayBuffer.maxByteLength_option.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		// 基本的な使用方法 - maxByteLengthオプションを指定
		"const buffer = new ArrayBuffer(10, { maxByteLength: 20 });",
		// 変数を使用した初期化
		"const initialSize = 8; const maxSize = 16; const buffer = new ArrayBuffer(initialSize, { maxByteLength: maxSize });",
		// オブジェクトリテラルでオプションを作成
		"const options = { maxByteLength: 32 }; const buffer = new ArrayBuffer(16, options);",
		// オブジェクトリテラル内にスプレッド構文での参照がある
		"const options = { maxByteLength: 32 }; const buffer = new ArrayBuffer(16, {...options});",
		// オブジェクトリテラル内にスプレッド構文での参照が多重にある
		"const options = { maxByteLength: 32 }; const buffer = new ArrayBuffer(16, {...{...options}});",
		// 引数のスプレッド構文を使用(const)
		"const args = [16, { maxByteLength: 32 }] as const; const buffer = new ArrayBuffer(...args);",
		// 引数が与えられたうえで、引数のスプレッド構文が使われている(const)
		"const args = [{ maxByteLength: 32 }] as const; const buffer = new ArrayBuffer(16, ...args);",
		// コンストラクタを変数に代入して使用
		"const BufferConstructor = ArrayBuffer; const buf = new BufferConstructor(16, { maxByteLength: 32 });",
		// extendsされている場合のsuperでの直接指定を検知
		'const MyArrayBuffer = class extends ArrayBuffer { constructor(size: number, options: Omit<ConstructorParameters<ArrayBufferConstructor>[1], "maxByteLength">) { super(size, { ...options, maxByteLength: 32 }); } }; const buffer = new MyArrayBuffer(16, { myOpts: true });',
		// extendsされている場合のconstructor省略を検知
		"const MyArrayBuffer = class extends ArrayBuffer {}; const buffer = new MyArrayBuffer(16, { maxByteLength: 32 });",
		// extendsされている場合のsuperの呼び出しでの利用を検知
		"const MyArrayBuffer = class extends ArrayBuffer { constructor(size: number, options: ConstructorParameters<ArrayBufferConstructor>[1]) { super(size, options); } }; const buffer = new MyArrayBuffer(16, { maxByteLength: 32 });",
	],
	validOnlyCodes: [
		// 通常のArrayBufferコンストラクタの使用（maxByteLengthなし）
		"const buffer = new ArrayBuffer(10);",
		// MaxByteLengthという名前のプロパティを持つ別のオブジェクト
		"const customOptions = { MaxByteLength: 100 }; const obj = { options: customOptions };",
		// 引数のスプレッド構文を使用
		"const args = [16, { maxByteLength: 32 }]; const buffer = new ArrayBuffer(...args);",
		// 引数が与えられたうえで、引数のスプレッド構文が使われている
		"const args = [{ maxByteLength: 32 }]; const buffer = new ArrayBuffer(16, ...args);",
		// ArrayBufferという名前のコンストラクタだが異なるクラス
		"const ArrayBuffer = class MyArrayBuffer { constructor(size: number, options: { maxByteLength?: number }) { this.size = size; this.options = options; } }; const buffer = new ArrayBuffer(10, { maxByteLength: 32 });",
		// 名前が似ているが別のオブジェクト
		"const customBuffer = { constructor: function(size, options) { this.size = size; this.options = options; } }; customBuffer.constructor(10, { maxByteLength: 20 });",
		// extendsされている場合にmaxByteLengthが渡されないときはエラーにならない
		"const MyArrayBuffer = class extends ArrayBuffer { constructor(size: number, options: Omit<ConstructorParameters<ArrayBufferConstructor>[1], 'maxByteLength'>) { super(size, options); } }; const buffer = new MyArrayBuffer(16, { myOpts: true });",
		// extendsされている場合のsuperでの直接指定だがArrayBufferという名前の異なるクラス
		"const ArrayBuffer = class MyArrayBuffer { constructor(size: number, options: { maxByteLength?: number }) { this.size = size; this.options = options; } }; const MyArrayBuffer2 = class extends ArrayBuffer { constructor(size: number, options: any) { super(size, { ...options, maxByteLength: 32 }); } }; const buffer = new MyArrayBuffer2(16, { myOpts: true });",
		// extendsされている場合のsuperの呼び出しでの利用だがArrayBufferという名前の異なるクラス
		"const ArrayBuffer = class MyArrayBuffer { constructor(size: number, options: { maxByteLength?: number }) { this.size = size; this.options = options; } }; const MyArrayBuffer2 = class extends ArrayBuffer { constructor(size: number, options: any) { super(size, options); } }; const buffer = new MyArrayBuffer2(16, { maxByteLength: 32 });",
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
