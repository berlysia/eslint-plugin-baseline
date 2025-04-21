
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
  concern: "Array.isArray",
  compatKeys: ["javascript.builtins.Array.isArray"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray",
  specUrl: "https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.isarray",  
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

    // Array constructor type check
    const isArrayConstructorType = createIsTargetType(typeChecker, "ArrayConstructor");

    return {
      // Check for Array.isArray() method calls
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          const object = node.callee.object;
          
          if (
            property.type === "Identifier" && 
            property.name === "isArray" &&
            object.type === "Identifier" && 
            object.name === "Array"
          ) {
            const objectTsNode = services.esTreeNodeToTSNodeMap.get(object);
            const objectType = typeChecker.getTypeAtLocation(objectTsNode);
            
            if (isArrayConstructorType(objectType)) {
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
