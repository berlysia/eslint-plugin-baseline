import { computeBaseline } from "compute-baseline";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "./checkIsAvailable.ts";
import { createMessageData, createRule, createSeed } from "./ruleFactory.ts";
import { createIsTargetType } from "./createIsTargetType.ts";

/**
 * メソッドの種類を表す文字列定数
 */
export const MethodType = {
	Instance: "instance", // インスタンスメソッド（例：Array.prototype.map）
	Static: "static", // 静的メソッド（例：Array.from）
} as const;

export type MethodTypeValue = typeof MethodType[keyof typeof MethodType];

export interface ObjectMethodRuleConfig {
	/**
	 * オブジェクトの種類（"Array", "String", "Map"など）
	 */
	objectTypeName: string;
	/**
	 * メソッド名（"map", "filter", "from"など）
	 */
	methodName: string;
	/**
	 * プロパティパスのプレフィックス（たとえば "javascript.builtins.Array" など）
	 */
	compatKeyPrefix: string;
	/**
	 * 完全なメソッド名（例："Array.prototype.map"または"Array.from"）
	 */
	concern: string;
	/**
	 * MDNのドキュメントURL
	 */
	mdnUrl?: string;
	/**
	 * 仕様書のURL
	 */
	specUrl?: string;
	/**
	 * 機能が最初に利用可能になった日付
	 */
	newlyAvailableAt?: string;
	/**
	 * 機能が広く利用可能になった日付
	 */
	widelyAvailableAt?: string;
}

/**
 * インスタンスメソッド（例：Array.prototype.map）用のルールを作成する関数
 */
export function createInstanceMethodRule(config: ObjectMethodRuleConfig) {
	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKeyPrefix}.${config.methodName}`],
		mdnUrl: config.mdnUrl,
		specUrl: config.specUrl,
		newlyAvailableAt: config.newlyAvailableAt,
		widelyAvailableAt: config.widelyAvailableAt,
	});

	const rule = createRule(seed, {
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
			const isTargetType = createIsTargetType(
				typeChecker,
				config.objectTypeName,
			);

			return {
				// インスタンスメソッド呼び出しのチェック
				CallExpression(node) {
					if (node.callee.type === "MemberExpression") {
						const property = node.callee.property;
						if (
							property.type === "Identifier" &&
							property.name === config.methodName
						) {
							const objectTsNode = services.esTreeNodeToTSNodeMap.get(
								node.callee.object,
							);
							const objectType = typeChecker.getTypeAtLocation(objectTsNode);

							if (isTargetType(objectType)) {
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

	return { seed, rule };
}

/**
 * スタティックメソッド（例：Array.from）用のルールを作成する関数
 */
export function createStaticMethodRule(config: ObjectMethodRuleConfig) {
	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKeyPrefix}.${config.methodName}`],
		mdnUrl: config.mdnUrl,
		specUrl: config.specUrl,
		newlyAvailableAt: config.newlyAvailableAt,
		widelyAvailableAt: config.widelyAvailableAt,
	});

	const rule = createRule(seed, {
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
			const isTargetType = createIsTargetType(
				typeChecker,
				config.objectTypeName,
			);

			return {
				// スタティックメソッド呼び出しのチェック
				CallExpression(node) {
					if (node.callee.type === "MemberExpression") {
						const object = node.callee.object;
						const property = node.callee.property;

						if (
							object.type === "Identifier" &&
							object.name === config.objectTypeName &&
							property.type === "Identifier" &&
							property.name === config.methodName
						) {
							const objectTsNode = services.esTreeNodeToTSNodeMap.get(object);
							const objectType = typeChecker.getTypeAtLocation(objectTsNode);

							if (isTargetType(objectType)) {
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

	return { seed, rule };
}

