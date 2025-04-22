import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
	objectTypeName: "Array",
	methodName: "reverse",
	compatKey: "javascript.builtins.Array.reverse",
	concern: "Array.prototype.reverse",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.reverse",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

export default rule;
