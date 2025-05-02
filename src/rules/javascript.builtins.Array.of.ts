import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createStaticMethodValidator } from "../utils/validators/createStaticMethodValidator.ts";

export const seed = createSeed({
	concern: "ArrayConstructor.of",
	compatKeys: ["javascript.builtins.Array.of"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/of",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.of",
	newlyAvailableAt: "2015-09-30",
	widelyAvailableAt: "2018-03-30",
});

const rule = createRuleV2(
	seed,
	createStaticMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "of",
	}),
);

export default rule;
