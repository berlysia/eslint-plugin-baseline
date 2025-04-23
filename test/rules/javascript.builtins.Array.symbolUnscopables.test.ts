import rule, {
	seed,
} from "../../src/rules/javascript.builtins.Array.symbolUnscopables.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const unscopablesValue = Array.prototype[Symbol.unscopables];`,
		`const arrayProto = Array.prototype; const unscopables = arrayProto[Symbol.unscopables];`,
		`function testSymbolUnscopables() { const arr = []; return arr[Symbol.unscopables]; }`,
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
