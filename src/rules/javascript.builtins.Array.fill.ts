
import { computeBaseline } from "compute-baseline";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
  createMessageData,
  createRule,
  createSeed,
} from "../utils/ruleFactory.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

export const seed = createSeed({
  concern: "Array.prototype.fill",
  compatKeys: ["javascript.builtins.Array.fill"],
  mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.fill",  
  newlyAvailableAt: "2015-09-01",
  widelyAvailableAt: "2018-03-01",
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

    // Check if a type is an Array or array-like object
    const isArrayType = createIsTargetType(typeChecker, "Array");

    return {
      // Check for Array.fill method calls
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          if (property.type === "Identifier" && property.name === "fill") {
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
