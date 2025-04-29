import { createConstructorArgumentPropertyRule } from "../utils/ArgumentPropertyRuleConfig.ts";

const { seed, rule } = createConstructorArgumentPropertyRule({
	compatKey: "javascript.builtins.ArrayBuffer.ArrayBuffer.maxByteLength_option",
	concern: "ArrayBuffer.maxByteLength_option",
	objectTypeName: "ArrayBuffer",
	objectTypeConstructorName: "ArrayBufferConstructor",
	argumentIndex: 1,
	propertyName: "maxByteLength",
	mdnUrl: undefined,
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer-constructor",
	newlyAvailableAt: "2024-07-09",
	widelyAvailableAt: undefined,
});

export { seed };

export default rule;
