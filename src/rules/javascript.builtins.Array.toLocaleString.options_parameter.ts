
import { computeBaseline } from "compute-baseline";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import { createMessageData, createRule, createSeed } from "../utils/ruleFactory.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

export const seed = createSeed({
  concern: "Array.prototype.toLocaleString options parameter",
  compatKeys: ["javascript.builtins.Array.toLocaleString.options_parameter"],
  mdnUrl: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/toLocaleString",
  specUrl: "https://tc39.es/ecma402/#sup-array.prototype.tolocalestring",
  newlyAvailableAt: "2020-01-15",
  widelyAvailableAt: "2022-07-15",
});

export const rule = createRule(seed, {
  create(context) {
    const options = context.options[0] || {};
    const ruleConfig: BaselineRuleConfig = ensureConfig(options);

    const baseline = computeBaseline({
      compatKeys: seed.compatKeys,
      checkAncestors: true,
    });

    const services = getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    // 対象の型かどうかをチェックする関数
    const isArrayType = createIsTargetType(typeChecker, "Array");
    const isArrayConstructorType = createIsTargetType(typeChecker, "ArrayConstructor");

    return {
      CallExpression(node) {
        // Check if it's a toLocaleString call with options parameter
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "toLocaleString" &&
          isArrayType(
            typeChecker.getTypeAtLocation(
              services.esTreeNodeToTSNodeMap.get(node.callee.object)
            )
          ) &&
          node.arguments.length >= 2 // Check if there's an options parameter (second argument)
        ) {
          const isAvailable = checkIsAvailable(ruleConfig, baseline);

          if (!isAvailable) {
            context.report({
              messageId: "notAvailable",
              node,
              data: createMessageData(seed, ruleConfig).notAvailable,
            });
          }
        } else if (
          // Check for explicit method call pattern: Array.prototype.toLocaleString.call(array, locales, options)
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "call" &&
          node.callee.object.type === "MemberExpression" &&
          node.callee.object.property.type === "Identifier" &&
          node.callee.object.property.name === "toLocaleString" &&
          node.callee.object.object.type === "MemberExpression" &&
          node.callee.object.object.property.type === "Identifier" &&
          node.callee.object.object.property.name === "prototype" &&
          isArrayConstructorType(
            typeChecker.getTypeAtLocation(
              services.esTreeNodeToTSNodeMap.get(node.callee.object.object.object)
            )
          ) &&
          node.arguments.length >= 3 // First arg is the array, second is locales, third is options
        ) {
          const isAvailable = checkIsAvailable(ruleConfig, baseline);

          if (!isAvailable) {
            context.report({
              messageId: "notAvailable",
              node,
              data: createMessageData(seed, ruleConfig).notAvailable,
            });
          }
        }
      },
    };
  },
});

export default rule;
