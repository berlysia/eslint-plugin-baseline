import { createConstructorArgumentPropertyValidator } from "./createTypePropertyValidator.ts";
import { createSeed, createRuleV2 } from "./ruleFactory.ts";

export interface ArgumentPropertyRuleConfig {
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
	 * 引数のインデックス
	 */
	argumentIndex: number;
	/**
	 * メソッド名（"map", "filter", "from"など）
	 */
	propertyName: string;
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

export function createConstructorArgumentPropertyRule(
	config: ArgumentPropertyRuleConfig,
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

	const createValidator = createConstructorArgumentPropertyValidator({
		typeName: config.objectTypeName,
		constructorTypeName: objectTypeConstructorName,
		argumentIndex: config.argumentIndex,
		optionProperty: config.propertyName,
	});

	const rule = createRuleV2(seed, createValidator);

	return { seed, rule };
}
