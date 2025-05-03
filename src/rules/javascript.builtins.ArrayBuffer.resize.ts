import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
	concern: "ArrayBuffer.prototype.resize",
	compatKeys: ["javascript.builtins.ArrayBuffer.resize"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/resize",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.resize",
	newlyAvailableAt: "2024-07-09",
	widelyAvailableAt: undefined,
});

const rule = createRuleV2(
	seed,
	createInstanceMethodValidator({
		typeName: "ArrayBuffer",
		constructorTypeName: "ArrayBufferConstructor",
		methodName: "resize",
	}),
);

export default rule;
