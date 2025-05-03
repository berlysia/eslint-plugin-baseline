import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstanceMethodValidator } from "../utils/validators/createInstanceMethodValidator.ts";

export const seed = createSeed({
  concern: "ArrayBuffer.prototype.transferToFixedLength",
  compatKeys: ["javascript.builtins.ArrayBuffer.transferToFixedLength"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/transferToFixedLength",
  specUrl: "https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.transfertofixedlength",
  newlyAvailableAt: "2024-03-05",
  widelyAvailableAt: undefined,
});

const rule = createRuleV2(
  seed,
  createInstanceMethodValidator({
    typeName: "ArrayBuffer",
    constructorTypeName: "ArrayBufferConstructor",
    methodName: "transferToFixedLength"
  }),
);

export default rule;