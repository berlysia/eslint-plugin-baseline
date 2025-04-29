import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "lastIndexOf",
	compatKey: "javascript.builtins.Array.lastIndexOf",
	concern: "Array.prototype.lastIndexOf",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.lastindexof",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

export default rule;
