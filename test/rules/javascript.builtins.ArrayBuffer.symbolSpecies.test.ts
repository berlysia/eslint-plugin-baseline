import rule, {
	seed,
} from "../../src/rules/javascript.builtins.ArrayBuffer.symbolSpecies.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`
    // Symbol.species クラス定義内
    class MyArrayBuffer extends ArrayBuffer {
      static get [Symbol.species]() { return ArrayBuffer; }
    }
    `,
		`
    // Symbol.species 直接アクセス
    console.log(ArrayBuffer[Symbol.species]);
    `,
		`
    // ArrayBuffer継承クラス内でのコンストラクタ使用（内部的にSymbol.speciesを使用）
    class MyArrayBuffer extends ArrayBuffer {
      slice(begin, end) {
        return new this.constructor(super.slice(begin, end));
      }
    }
    `,
		"ArrayBuffer.prototype[Symbol.species].call(new ArrayBuffer(8));",
	],
	validOnlyCodes: [
		`
    // 非対象オブジェクトのSymbol.species
    class CustomBuffer {
      static get [Symbol.species]() { return CustomBuffer; }
    }
    `,
		`
    // 通常のArrayBufferの使用
    const buffer = new ArrayBuffer(8);
    new Uint8Array(buffer);
    `,
	],
	validOption: {
		asOf: "2019-03-21",
		support: "widely",
	},
	invalidOption: {
		asOf: "2019-03-19",
		support: "widely",
	},
});
