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
	concern: "Array[Symbol.unscopables]の使用",
	compatKeys: ["javascript.builtins.Array.@@unscopables"],
	mdnUrl: undefined,
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype-%symbol.unscopables%",
	newlyAvailableAt: "2016-09-20",
	widelyAvailableAt: "2019-03-20",
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

		const isArrayType = createIsTargetType(typeChecker, "Array");

		return {
			// すべてのMemberExpressionを処理する関数
			MemberExpression(node) {
				// パターン1: Symbol.unscopables.Array へのアクセスを検出
				if (
					node.object.type === "MemberExpression" &&
					node.object.object.type === "Identifier" &&
					node.object.object.name === "Symbol" &&
					node.object.property.type === "Identifier" &&
					node.object.property.name === "unscopables" &&
					node.property.type === "Identifier" &&
					node.property.name === "Array"
				) {
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

				// パターン2: Array.prototype[Symbol.unscopables] へのアクセスを検出
				if (
					node.object.type === "MemberExpression" &&
					node.object.object.type === "MemberExpression" &&
					node.object.object.object.type === "Identifier" &&
					node.object.object.object.name === "Array" &&
					node.object.object.property.type === "Identifier" &&
					node.object.object.property.name === "prototype" &&
					node.object.property.type === "MemberExpression" &&
					node.object.property.object.type === "Identifier" &&
					node.object.property.object.name === "Symbol" &&
					node.object.property.property.type === "Identifier" &&
					node.object.property.property.name === "unscopables"
				) {
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

				// パターン3: Array.prototype の unscopables プロパティ直接参照を検出
				if (
					node.computed &&
					node.property.type === "MemberExpression" &&
					node.property.object.type === "Identifier" &&
					node.property.object.name === "Symbol" &&
					node.property.property.type === "Identifier" &&
					node.property.property.name === "unscopables"
				) {
					const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.object);
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
			},
		};
	},
});

export default rule;
