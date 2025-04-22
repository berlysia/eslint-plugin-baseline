import { createStaticMethodRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createStaticMethodRule({
	objectTypeName: "ArrayConstructor",
	methodName: "isArray",
	compatKey: "javascript.builtins.Array.isArray",
	concern: "ArrayConstructor.isArray",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.isarray",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

export default rule;
