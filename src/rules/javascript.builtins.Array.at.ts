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
  concern: "Array.prototype.at",
  compatKeys: ["javascript.builtins.Array.at"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/at",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.at",  
  newlyAvailableAt: "2022-03-14",
  widelyAvailableAt: "2024-09-14",
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
    const isArrayType = createIsTargetType(typeChecker, "Array");

    return {
      // Array.at()メソッド呼び出しのチェック
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          if (property.type === "Identifier" && property.name === "at") {
            const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.callee.object);
            const objectType = typeChecker.getTypeAtLocation(objectTsNode);
            
            if (isArrayType(objectType)) {
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