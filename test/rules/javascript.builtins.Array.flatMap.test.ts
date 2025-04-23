import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.flatMap.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3].flatMap(x => [x, x * 2])`,
		`const arr = [4, 5, 6]; arr.flatMap(x => [x, x * 2])`,
		"Array.prototype.flatMap.call([1, 2, 3], x => [x, x * 2])",
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
