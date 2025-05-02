import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { createInstancePropertyValidator } from "../utils/validators/createPropertyValidator.ts";

export const seed = createSeed({
  concern: "ArrayBuffer.prototype.detached",
  compatKeys: ["javascript.builtins.ArrayBuffer.detached"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/detached",
  specUrl: "https://tc39.es/ecma262/multipage/structured-data.html#sec-get-arraybuffer.prototype.detached",
  newlyAvailableAt: "2024-03-05",
  widelyAvailableAt: undefined,
});

const rule = createRuleV2(
  seed,
  createInstancePropertyValidator({
    typeName: "ArrayBuffer",
    propertyName: "detached"
  }),
);

export default rule;
