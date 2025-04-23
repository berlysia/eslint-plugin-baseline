import rule, { seed } from "../../src/rules/javascript.builtins.Array.shift.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
	rule,
	seed,
	codes: [
		`const arr = [1, 2, 3]; arr.shift();`,
		`[1, 2, 3].shift();`,
		`const myArray = []; myArray.shift();`,
		`function test(): void { const array = [1]; array.shift(); }`,
		`const array = new Array(5); array.shift();`,
		"Array.prototype.shift.call([1, 2, 3]);",
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
