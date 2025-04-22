import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
	objectTypeName: "Array",
	methodName: "includes",
	compatKey: "javascript.builtins.Array.includes",
	concern: "Array.prototype.includes",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/includes",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.includes",
	newlyAvailableAt: "2016-08-02",
	widelyAvailableAt: "2019-02-02",
});

export default rule;
