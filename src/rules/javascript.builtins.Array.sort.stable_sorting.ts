import { createNoopRule } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = createNoopRule({
	objectTypeName: "Array",
	methodName: "sort",
	compatKey: "javascript.builtins.Array.sort.stable_sorting",
	concern: "Array.sort stable_sorting",
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#stable_sorting",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.sort",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

export default rule;
