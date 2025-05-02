import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
	concern: "Array.prototype.pop",
	compatKeys: ["javascript.builtins.Array.pop"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/pop",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.pop",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createInstanceMethodValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		methodName: "pop",
	}),
);

export default rule;
