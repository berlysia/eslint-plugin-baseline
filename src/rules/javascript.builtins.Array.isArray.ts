import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createStaticMethodValidator } from "../utils/validators/createStaticMethodValidator.ts";

export const seed = createSeed({
	concern: "ArrayConstructor.isArray",
	compatKeys: ["javascript.builtins.Array.isArray"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.isarray",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createStaticMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "isArray",
	}),
);

export default rule;
