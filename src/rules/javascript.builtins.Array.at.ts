import { createInstanceMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createInstanceMethodRule({
	objectTypeName: "Array",
	methodName: "at",
	compatKey: "javascript.builtins.Array.at",
	concern: "Array.prototype.at",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.at",
	newlyAvailableAt: "2022-03-14",
	widelyAvailableAt: "2024-09-14",
});

export default rule;
