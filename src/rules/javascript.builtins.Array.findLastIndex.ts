import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "findLastIndex",
	compatKey: "javascript.builtins.Array.findLastIndex",
	concern: "Array.prototype.findLastIndex",
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLastIndex",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.findlastindex",
	newlyAvailableAt: "2022-08-23",
	widelyAvailableAt: "2025-02-23",
});

export default rule;
