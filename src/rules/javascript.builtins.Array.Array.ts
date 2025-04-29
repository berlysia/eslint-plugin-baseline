import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createConstructorUsageValidator } from "../utils/validators/createConstructorValidator.ts";

export const seed = createSeed({
	concern: "Array constructor",
	compatKeys: ["javascript.builtins.Array.Array"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Array",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array-constructor",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

// 新しいcreateRuleV2とcreateConstructorUsageValidatorを使用
const rule = createRuleV2(
	seed,
	createConstructorUsageValidator({
		typeName: "Array",
		constructorTypeName: "ArrayConstructor",
		detectWithoutNew: true,
	}),
);

export default rule;
