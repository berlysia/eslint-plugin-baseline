import { createStaticMethodExistenceRule } from "../utils/ruleFactories/createMethodExistenceRule.ts";

export const { seed, rule } = createStaticMethodExistenceRule({
	objectTypeName: "Array",
	methodName: "from",
	compatKey: "javascript.builtins.Array.from",
	concern: "ArrayConstructor.from",
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/from",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.from",
	newlyAvailableAt: "2015-09-30",
	widelyAvailableAt: "2018-03-30",
});

export default rule;
