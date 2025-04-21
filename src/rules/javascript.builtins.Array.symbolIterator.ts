import { computeBaseline } from "compute-baseline";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
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
	concern: "Array Symbol.iterator",
	compatKeys: ["javascript.builtins.Array.@@iterator"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Symbol.iterator",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array.prototype-%symbol.iterator%",
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

		const messageData = createMessageData(seed, config);

		function checkAvailability(node: any) {
			const isAvailable = checkIsAvailable(config, baseline);
			if (!isAvailable) {
				context.report({
					node,
					messageId: "notAvailable",
					data: messageData.notAvailable,
				});
			}
		}

		return {
			// Case 1: Direct access to Symbol.iterator on an array
			MemberExpression(node: any) {
				// Symbol.iteratorの参照を検出
				if (
					node.property.type === AST_NODE_TYPES.MemberExpression &&
					node.property.object?.name === "Symbol" &&
					node.property.property?.name === "iterator"
				) {
					const objectType = services.getTypeAtLocation(node.object);
					if (isArrayType(objectType)) {
						checkAvailability(node);
					}
				} else if (
					// 直接のSymbol.iteratorプロパティのアクセス
					node.property.type === AST_NODE_TYPES.Identifier &&
					node.computed &&
					node.property.name === "Symbol.iterator"
				) {
					const objectType = services.getTypeAtLocation(node.object);
					if (isArrayType(objectType)) {
						checkAvailability(node);
					}
				}
			},

			// Case 2: For...of loop on arrays uses Symbol.iterator internally
			ForOfStatement(node) {
				const rightType = services.getTypeAtLocation(node.right);

				if (isArrayType(rightType)) {
					checkAvailability(node);
				}
			},

			// Case 3: Spread operator on arrays also uses Symbol.iterator internally
			SpreadElement(node) {
				const argType = services.getTypeAtLocation(node.argument);

				if (isArrayType(argType)) {
					checkAvailability(node);
				}
			},

			// Case 4: Array destructuring also uses Symbol.iterator
			ArrayPattern(node) {
				if (
					node.parent &&
					(node.parent.type === AST_NODE_TYPES.VariableDeclarator ||
						node.parent.type === AST_NODE_TYPES.AssignmentExpression)
				) {
					const initOrRight =
						node.parent.type === AST_NODE_TYPES.VariableDeclarator
							? node.parent.init
							: node.parent.right;

					// nullチェックを追加
					if (initOrRight) {
						const initType = services.getTypeAtLocation(initOrRight);

						if (isArrayType(initType)) {
							checkAvailability(node);
						}
					}
				}
			},
		};
	},
});

export default rule;
