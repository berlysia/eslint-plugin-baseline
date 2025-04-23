import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.forEach.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`[1, 2, 3].forEach(item => console.log(item));`,
		"Array.prototype.forEach.call([1, 2, 3], item => console.log(item));",
	],
	validOption: {
		asOf: "2020-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
