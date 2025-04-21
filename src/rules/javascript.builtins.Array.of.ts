import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";
import {
  createMessageData,
  createRule,
  createSeed,
} from "../utils/ruleFactory.ts";

export const seed = createSeed({
  concern: "Array.of",
  compatKeys: ["javascript.builtins.Array.of"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/of",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.of",  
  newlyAvailableAt: "2015-09-30",
  widelyAvailableAt: "2018-03-30",
});

const rule = createRule(seed, {
  create(context) {
    const options = context.options[0] || {};
    const config: BaselineRuleConfig = ensureConfig(options);

    const baseline = computeBaseline({
      compatKeys: seed.compatKeys,
      checkAncestors: true,
    });

    const services = getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    // Array型の判定
    const isTargetConstructorType = createIsTargetType(
      typeChecker,
      "ArrayConstructor",
    );

    return {
      // Array.of()メソッド呼び出しのチェック
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          const object = node.callee.object;

          // Check if the property is "of"
          if (property.type === "Identifier" && property.name === "of") {
            // Fast path check for direct Array.of usage
            if (object.type === "Identifier" && object.name === "Array") {
              const isAvailable = checkIsAvailable(config, baseline);
              if (!isAvailable) {
                context.report({
                  messageId: "notAvailable",
                  node,
                  data: createMessageData(seed, config).notAvailable,
                });
              }
              return;
            }

            // Detailed type check for other cases (e.g., subclasses, aliases)
            const tsNode = services.esTreeNodeToTSNodeMap.get(object);
            const type = typeChecker.getTypeAtLocation(tsNode);

            if (isTargetConstructorType(type)) {
              const isAvailable = checkIsAvailable(config, baseline);

              if (!isAvailable) {
                context.report({
                  messageId: "notAvailable",
                  node,
                  data: createMessageData(seed, config).notAvailable,
                });
              }
            }
          }
        }
      }
    };
  },
});

export default rule;
