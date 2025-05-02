import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createStaticMethodValidator } from "../utils/validators/createStaticMethodValidator.ts";

export const seed = createSeed({
	concern: "ArrayConstructor.from",
	compatKeys: ["javascript.builtins.Array.from"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/from",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.from",
	newlyAvailableAt: "2015-09-30",
	widelyAvailableAt: "2018-03-30",
});

const rule = createRuleV2(
	seed,
	createStaticMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "from",
	}),
);

export default rule;
