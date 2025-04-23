import rule, {
	seed,
} from "../../src/rules/javascript.statements.async_function.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [`async function foo() {}`],
	validOption: {
		asOf: "2024-01-01",
		support: "widely",
	},
	invalidOption: {
		asOf: "2017-01-01",
		support: "widely",
	},
});
