import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.sort.stable_sorting.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [],
	validOnlyCodes: [
		// ソート動作についてコードだけからstablityへの期待を判断することはできないので、通ることだけ見る
		"[3, 1, 2].sort();",
		`const obj = { sort: () => {} }; obj.sort();`,
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
