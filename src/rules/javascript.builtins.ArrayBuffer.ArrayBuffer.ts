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

export const seed = createSeed({
	concern: "ArrayBuffer.ArrayBuffer",
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

		return {
			// ArrayBufferコンストラクタのチェック
			NewExpression(node) {
				const callee = node.callee;

				// 直接ArrayBufferを使用するケース
				if (callee.type === "Identifier" && callee.name === "ArrayBuffer") {
					const isAvailable = checkIsAvailable(ruleConfig, baseline);
					if (!isAvailable) {
						context.report({
							messageId: "notAvailable",
							node,
							data: createMessageData(seed, ruleConfig).notAvailable,
						});
					}
					// 変数に代入したArrayBufferを使用するケース
				} else if (callee.type === "Identifier") {
					const tsNode = services.esTreeNodeToTSNodeMap.get(callee);
					const type = typeChecker.getTypeAtLocation(tsNode);
					const symbol = type.getSymbol();

					if (symbol && symbol.getName() === "ArrayBuffer") {
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
			},
			// MemberExpressionもチェックする（例: ArrayBuffer.name など）
			MemberExpression(node) {
				const object = node.object;

				if (object.type === "Identifier" && object.name === "ArrayBuffer") {
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
