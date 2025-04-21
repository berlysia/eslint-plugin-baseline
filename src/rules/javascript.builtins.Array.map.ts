
import { computeBaseline } from "compute-baseline";
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
  concern: "Array.prototype.map",
  compatKeys: ["javascript.builtins.Array.map"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/map",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype.map",  
  newlyAvailableAt: "2015-07-29",
  widelyAvailableAt: "2018-01-29",
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

    // Check if the type is Array or ArrayLike
    const isArrayType = createIsTargetType(typeChecker, "Array");

    return {
      // Look for method calls with 'map' property name
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          if (property.type === "Identifier" && property.name === "map") {
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
