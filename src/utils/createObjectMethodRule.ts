import { createRule, createRuleV2, createSeed } from "./ruleFactory.ts";
import {
	createInstanceMethodValidator,
	createStaticMethodValidator,
} from "./createTypePropertyValidator.ts";

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
	 * compatKey（ "javascript.builtins.Array.map" など）
	 */
	compatKey: string;
	/**
	 * 完全なメソッド名（例："Array.prototype.map"または"Array.from"）
	 */
	concern: string;
	/**
	 * オブジェクトの種類（"Array", "String", "Map"など）
	 */
	objectTypeName: string;
	/**
	 * コンストラクタの型名（"ArrayConstructor", "MapConstructor"など）
	 */
	objectTypeConstructorName?: string;
	/**
	 * メソッド名（"map", "filter", "from"など）
	 */
	methodName: string;
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

export function createNoopRule(config: ObjectMethodRuleConfig) {
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
export function createInstanceMethodRule(config: ObjectMethodRuleConfig) {
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

	const createValidator = createInstanceMethodValidator(
		config.objectTypeName,
		objectTypeConstructorName,
		config.methodName,
	);

	const rule = createRuleV2(seed, createValidator);

	return { seed, rule };
}

/**
 * スタティックメソッド（例：Array.from）用のルールを作成する関数
 */
export function createStaticMethodRule(config: ObjectMethodRuleConfig) {
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

	const createValidator = createStaticMethodValidator(
		config.objectTypeName,
		objectTypeConstructorName,
		config.methodName,
	);

	const rule = createRuleV2(seed, createValidator);

	return { seed, rule };
}
