import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.prototype.transfer",
	compatKeys: ["javascript.builtins.ArrayBuffer.transfer"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transfer",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.transfer",
	newlyAvailableAt: "2024-03-05",
	widelyAvailableAt: undefined,
});

const rule = createRuleV2(
	seed,
	createInstanceMethodValidator({
		typeName: "ArrayBuffer",
		constructorTypeName: "ArrayBufferConstructor",
		methodName: "transfer",
	}),
);

export default rule;
