import { createInstanceMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createInstanceMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "toLocaleString",
	compatKey: "javascript.builtins.Array.toLocaleString",
	concern: "Array.prototype.toLocaleString",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.tolocalestring",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

export default rule;
