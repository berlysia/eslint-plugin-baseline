import "./utils/init.ts";
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.toLocaleString.locales_parameter.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    "const arr = [1, 2, 3]; arr.toLocaleString('en-US');", // 基本的な使用方法（ロケールを指定）
    "const arr = [1, 2, 3]; arr.toLocaleString(['en-US', 'ja-JP']);", // ロケール配列を指定
    "const prices = [7, 500, 8123, 12]; prices.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });", // オプション付き
    "Array.prototype.toLocaleString.call([1, 2, 3], 'en-US');", // 明示的なメソッド呼び出し（ロケール指定）
  ],
  validOnlyCodes: [
    "const arr = [1, 2, 3]; arr.toLocaleString();", // localesパラメータなし - このルールの対象外
    "const obj = { toLocaleString: (locale) => 'value' }; obj.toLocaleString('en-US');", // Arrayではないオブジェクトのメソッド
    "Array.prototype.toLocaleString.call([1, 2, 3]);", // パラメータなしの明示的呼び出し
  ],
  validOption: {
    asOf: "2022-08-01", // widelyAvailableAtの日付より後（2022-07-15）
    support: "widely",
  },
  invalidOption: {
    asOf: "2019-01-01", // newlyAvailableAtの日付より前（2020-01-15）
    support: "widely",
  },
});
