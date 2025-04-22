import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
	objectTypeName: "Array",
	methodName: "shift",
	compatKey: "javascript.builtins.Array.shift",
	concern: "Array.prototype.shift",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/shift",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.shift",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

export default rule;
