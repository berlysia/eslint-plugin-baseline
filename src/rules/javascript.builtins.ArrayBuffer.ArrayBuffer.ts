import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createConstructorUsageValidator } from "../utils/validators/createConstructorValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer constructor",
	compatKeys: ["javascript.builtins.ArrayBuffer.ArrayBuffer"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/ArrayBuffer",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer-constructor",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
});

const rule = createRuleV2(
	seed,
	createConstructorUsageValidator({
		typeName: "ArrayBuffer",
		constructorTypeName: "ArrayBufferConstructor",
		detectWithoutNew: false,
	}),
);

export default rule;
