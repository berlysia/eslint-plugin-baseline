import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.symbolSpecies.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`
        // Symbol.species クラス定義内
        class MyArray extends Array {
          static get [Symbol.species]() { return Array; }
        }
      `,
		`
        // Symbol.species 直接アクセス
        console.log(Array[Symbol.species]);
      `,
		`
        // Array継承クラス内でのコンストラクタ使用（内部的にSymbol.speciesを使用）
        class MyArray extends Array {
          filter(callback) {
            return new this.constructor(super.filter(callback));
          }
        }
      `,
		"Array.prototype[Symbol.species].call([1, 2, 3]);",
	],
	validOption: {
		asOf: "2023-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2019-01-01",
		support: "widely",
	},
});
