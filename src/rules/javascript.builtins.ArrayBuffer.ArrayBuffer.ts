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
	concern: "ArrayBuffer constructor",
	compatKeys: ["javascript.builtins.ArrayBuffer.ArrayBuffer"],
	mdnUrl:
		"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/ArrayBuffer",
	specUrl:
		"https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer-constructor",
	newlyAvailableAt: "2015-07-29",
	widelyAvailableAt: "2018-01-29",
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

		// チェック用の共通関数
		function checkArrayBufferConstructorAvailability(node: TSESTree.Node) {
			const isAvailable = checkIsAvailable(ruleConfig, baseline);
			if (!isAvailable) {
				context.report({
					messageId: "notAvailable",
					node,
					data: createMessageData(seed, ruleConfig).notAvailable,
				});
			}
		}

		// ArrayBuffer コンストラクタを検知するための型チェック
		const isArrayBufferType = createIsTargetType(
			typeChecker,
			"ArrayBufferConstructor",
		);

		return {
			// セレクタで直接的なArrayBuffer使用をチェック
			"NewExpression[callee.name='ArrayBuffer']"(node: TSESTree.NewExpression) {
				checkArrayBufferConstructorAvailability(node);
			},

			// 型チェックで間接的なArrayBuffer使用もカバー（変数に代入されたケースなど）
			NewExpression(node) {
				// セレクタでカバーされていない場合のみチェック
				if (
					node.callee.type !== "Identifier" ||
					node.callee.name !== "ArrayBuffer"
				) {
					const tsNode = services.esTreeNodeToTSNodeMap.get(node.callee);
					const type = typeChecker.getTypeAtLocation(tsNode);

					if (isArrayBufferType(type)) {
						checkArrayBufferConstructorAvailability(node);
					}
				}
			},

			// ArrayBuffer 関連のプロパティアクセスをチェック
			"MemberExpression[object.name='ArrayBuffer']"(
				node: TSESTree.MemberExpression,
			) {
				checkArrayBufferConstructorAvailability(node);
			},
		};
	},
});

export default rule;
