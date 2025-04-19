import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
	createMessageData,
	createRule,
	createSeed,
} from "../utils/ruleFactory.ts";
import { TSESTree } from "@typescript-eslint/utils";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import * as ts from "typescript";

export const seed = createSeed({
	concern: "AggregateError.errors",
	compatKeys: ["javascript.builtins.AggregateError.errors"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/errors",
	specUrl:
		"https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-aggregate-error",
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

		const targetSymbol = typeChecker.resolveName(
			"AggregateError",
			/* location */ undefined,
			ts.SymbolFlags.All,
			/* excludeGlobals */ false,
		);
		if (!targetSymbol) {
			return {};
		}

		const targetType = typeChecker.getDeclaredTypeOfSymbol(targetSymbol);

		function isAggregateErrorType(type: ts.Type): boolean {
			const symbol = type.getSymbol();
			if (!symbol) return false;

			// 直接のAggregateError型チェック
			if (symbol.getName() === "AggregateError") return true;

			// Union型のチェック
			if (type.isUnion()) {
				return type.types.some((t) => isAggregateErrorType(t));
			}

			// 継承チェック
			const baseTypes = type.getBaseTypes();
			if (baseTypes) {
				return baseTypes.some((t) => isAggregateErrorType(t));
			}

			// 代入可能性のチェック
			if (targetType && typeChecker.isTypeAssignableTo(type, targetType)) {
				return true;
			}

			return false;
		}

		function checkAndReport(node: TSESTree.Node, objectNode: TSESTree.Node) {
			const objectType = typeChecker.getTypeAtLocation(
				services.esTreeNodeToTSNodeMap.get(objectNode),
			);

			if (isAggregateErrorType(objectType)) {
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

		return {
			// メンバーアクセス (obj.errors, obj?.errors)
			MemberExpression(node: TSESTree.MemberExpression) {
				if (
					node.property.type === "Identifier" &&
					node.property.name === "errors"
				) {
					checkAndReport(node, node.object);
				}
			},

			// 分割代入 ({ errors } = aggregateError)
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				if (node.id.type === "ObjectPattern" && node.init) {
					const errorsProp = node.id.properties.find(
						(prop) =>
							prop.type === "Property" &&
							prop.key.type === "Identifier" &&
							prop.key.name === "errors",
					);

					if (errorsProp) {
						checkAndReport(errorsProp, node.init);
					}
				}
			},
		};
	},
});

export default rule;
