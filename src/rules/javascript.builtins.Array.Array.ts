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
	concern: "Array constructor",
	compatKeys: ["javascript.builtins.Array.Array"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/Array",
	specUrl:
		"https://tc39.es/ecma262/multipage/indexed-collections.html#sec-array-constructor",
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

		// チェック用の関数
		function checkArrayConstructorAvailability(node: TSESTree.Node) {
			const isAvailable = checkIsAvailable(config, baseline);

			if (!isAvailable) {
				context.report({
					messageId: "notAvailable",
					node,
					data: createMessageData(seed, config).notAvailable,
				});
			}
		}

		// Array コンストラクタを検知するための型チェック
		const isArrayType = createIsTargetType(typeChecker, "ArrayConstructor");

		return {
			// セレクタで直接的なArray使用をチェック
			"NewExpression[callee.name='Array']"(node: TSESTree.NewExpression) {
				checkArrayConstructorAvailability(node);
			},

			// セレクタで直接的なArray関数呼び出しをチェック
			"CallExpression[callee.name='Array']"(node: TSESTree.CallExpression) {
				checkArrayConstructorAvailability(node);
			},

			// 型チェックで間接的なArray使用もカバー（変数に代入されたケースなど）
			NewExpression(node) {
				// セレクタでカバーされていない場合のみチェック
				if (node.callee.type !== "Identifier" || node.callee.name !== "Array") {
					const tsNode = services.esTreeNodeToTSNodeMap.get(node.callee);
					const type = typeChecker.getTypeAtLocation(tsNode);

					if (isArrayType(type)) {
						checkArrayConstructorAvailability(node);
					}
				}
			},

			CallExpression(node) {
				// セレクタでカバーされていない場合のみチェック
				if (
					!(
						node.callee.type === "Identifier" && node.callee.name === "Array"
					) &&
					node.callee.type === "Identifier"
				) {
					const tsNode = services.esTreeNodeToTSNodeMap.get(node.callee);
					const type = typeChecker.getTypeAtLocation(tsNode);

					if (isArrayType(type)) {
						checkArrayConstructorAvailability(node);
					}
				}
			},
		};
	},
});

export default rule;
