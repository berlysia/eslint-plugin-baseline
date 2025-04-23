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
export const METHOD_TYPE = {
	Instance: "instance", // インスタンスメソッド（例：Array.prototype.map）
	Static: "static", // 静的メソッド（例：Array.from）
} as const;

export type MethodType = (typeof METHOD_TYPE)[keyof typeof METHOD_TYPE];

export type MethodTypeValue = (typeof METHOD_TYPE)[keyof typeof METHOD_TYPE];

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
	compatKey: string;
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

export function createNoopRule(
	config: ObjectMethodRuleConfig & { objectTypeConstructorName?: string },
) {
	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKey}`],
		mdnUrl: config.mdnUrl,
		specUrl: config.specUrl,
		newlyAvailableAt: config.newlyAvailableAt,
		widelyAvailableAt: config.widelyAvailableAt,
	});

	return {
		seed,
		rule: createRule(seed, {
			create(_context) {
				return {};
			},
		}),
	};
}

/**
 * インスタンスメソッド（例：Array.prototype.map）用のルールを作成する関数
 */
export function createInstanceMethodRule(
	config: ObjectMethodRuleConfig & { objectTypeConstructorName?: string },
) {
	const objectTypeConstructorName =
		config.objectTypeConstructorName ?? `${config.objectTypeName}Constructor`;

	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKey}`],
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
			const isTargetConstructorType = createIsTargetType(
				typeChecker,
				objectTypeConstructorName,
			);

			return {
				// インスタンスメソッド呼び出しとアクセスのチェック
				MemberExpression(node) {
					if (
						node.property.type === "Identifier" &&
						node.property.name === config.methodName && // Check if it's a normal instance type
						isTargetType(
							typeChecker.getTypeAtLocation(
								services.esTreeNodeToTSNodeMap.get(node.object),
							),
						)
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
						// ${ConstructorName}.prototype.${method}() のようなアクセスパターンをチェック
						node.object.type === "MemberExpression" &&
						isTargetConstructorType(
							typeChecker.getTypeAtLocation(
								services.esTreeNodeToTSNodeMap.get(node.object.object),
							),
						) &&
						node.object.property.type === "Identifier" &&
						node.object.property.name === "prototype" &&
						node.property.type === "Identifier" &&
						node.property.name === config.methodName
					) {
						// Check for ObjectType.prototype access pattern
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

	return { seed, rule };
}

/**
 * スタティックメソッド（例：Array.from）用のルールを作成する関数
 */
export function createStaticMethodRule(config: ObjectMethodRuleConfig) {
	const seed = createSeed({
		concern: config.concern,
		compatKeys: [`${config.compatKey}`],
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
				MemberExpression(node) {
					const object = node.object;
					const property = node.property;

					if (
						property.type === "Identifier" &&
						property.name === config.methodName &&
						isTargetType(
							typeChecker.getTypeAtLocation(
								services.esTreeNodeToTSNodeMap.get(object),
							),
						)
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

	return { seed, rule };
}
