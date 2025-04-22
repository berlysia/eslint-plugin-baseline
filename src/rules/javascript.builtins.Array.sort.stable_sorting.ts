
import { computeBaseline } from "compute-baseline";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { createSeed, createRule, createMessageData } from "../utils/ruleFactory.ts";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

export const seed = createSeed({
  concern: "Array.prototype.sort (stable sorting)",
  compatKeys: ["javascript.builtins.Array.sort.stable_sorting"],
  mdnUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#stable_sorting",
  specUrl: undefined,
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

    const isArrayType = createIsTargetType(typeChecker, "Array");

    return {
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          if (property.type === "Identifier" && property.name === "sort") {
            const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.callee.object);
            const objectType = typeChecker.getTypeAtLocation(objectTsNode);

            if (isArrayType(objectType)) {
              const isAvailable = checkIsAvailable(ruleConfig, baseline);

              if (!isAvailable) {
                context.report({
                  messageId: "notAvailable",
                  node,
                  data: createMessageData(seed, ruleConfig).notAvailable,
                });
              }
            }
          }
        }
      },
    };
  },
});

export default rule;
