import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "findIndex",
	compatKey: "javascript.builtins.Array.findIndex",
	concern: "Array.prototype.findIndex",
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.findindex",
	newlyAvailableAt: "2015-09-01",
	widelyAvailableAt: "2018-03-01",
});

export default rule;
