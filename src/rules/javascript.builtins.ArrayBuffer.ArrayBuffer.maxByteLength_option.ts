import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createConstructorArgumentPropertyValidator } from "../utils/validators/createConstructorValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.maxByteLength_option",
	compatKeys: [
		"javascript.builtins.ArrayBuffer.ArrayBuffer.maxByteLength_option",
	],
	mdnUrl: undefined,
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer-constructor",
	newlyAvailableAt: "2024-07-09",
	widelyAvailableAt: undefined,
});

const rule = createRuleV2(
	seed,
	createConstructorArgumentPropertyValidator({
		typeName: "ArrayBuffer",
		constructorTypeName: "ArrayBufferConstructor",
		argumentIndex: 1,
		optionProperty: "maxByteLength",
	}),
);

export default rule;
