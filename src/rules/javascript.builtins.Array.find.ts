import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "find",
	compatKey: "javascript.builtins.Array.find",
	concern: "Array.prototype.find",
	mdnUrl:
		"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.find",
	newlyAvailableAt: "2015-09-01",
	widelyAvailableAt: "2018-03-01",
});

export default rule;
