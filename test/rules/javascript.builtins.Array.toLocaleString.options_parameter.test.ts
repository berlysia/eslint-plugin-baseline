
import "./utils/init.ts";
import rule, {
  seed,
} from "../../src/rules/javascript.builtins.Array.toLocaleString.options_parameter.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [
    "const arr = [1, 2, 3]; arr.toLocaleString('en-US', { style: 'currency', currency: 'USD' });", // オプションパラメータを使用
    "const numArr = [1000, 2000, 3000]; numArr.toLocaleString('de-DE', { maximumFractionDigits: 2 });", // 別のオプションを指定
    "const prices = [10.99, 5.5, 7]; prices.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });", // 通貨スタイルとロケールの組み合わせ
    "Array.prototype.toLocaleString.call([1, 2, 3], 'fr-FR', { minimumFractionDigits: 2 });", // 明示的なメソッド呼び出し
  ],
  validOnlyCodes: [
    "const arr = [1, 2, 3]; arr.toLocaleString('en-US');", // オプションパラメータなし (別ルールの対象)
    "const arr = [1, 2, 3]; arr.toLocaleString();", // パラメータなし (別ルールの対象)
    "const obj = { toLocaleString: (locales, options) => 'value' }; obj.toLocaleString('en-US', {});", // Array以外のオブジェクト
    "const num = 1234.5; num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });", // Numberオブジェクトのメソッド
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
