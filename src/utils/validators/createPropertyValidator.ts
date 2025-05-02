import type { TSESTree } from "@typescript-eslint/typescript-estree";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";
import type { BaselineRuleConfig } from "../../types.ts";
import type { RuleModuleSeed } from "../ruleFactory.ts";
import { createSharedValidator } from "./sharedValidator.ts";

/**
 * プロパティアクセスタイプ
 */
export const PROPERTY_ACCESS_TYPE = {
	Instance: "instance",
	Static: "static",
} as const;

export type PropertyAccessType =
	(typeof PROPERTY_ACCESS_TYPE)[keyof typeof PROPERTY_ACCESS_TYPE];

export interface PropertyValidatorOptions {
	/**
	 * 対象オブジェクトの型名
	 */
	typeName: string;
	/**
	 * コンストラクタの型名（スタティックプロパティの場合に使用）
	 */
	constructorTypeName?: string;
	/**
	 * プロパティ名
	 */
	propertyName: string;
	/**
	 * プロパティアクセスタイプ
	 */
	accessType: PropertyAccessType;
}

/**
 * インスタンスプロパティのアクセスを検証するバリデータ
 */
export function createInstancePropertyValidator(
	options: Omit<PropertyValidatorOptions, "accessType" | "constructorTypeName">,
) {
	return createPropertyValidator({
		...options,
		accessType: PROPERTY_ACCESS_TYPE.Instance,
	});
}

/**
 * スタティックプロパティのアクセスを検証するバリデータ
 */
export function createStaticPropertyValidator(
	options: Omit<PropertyValidatorOptions, "accessType"> & {
		constructorTypeName: string;
	},
) {
	return createPropertyValidator({
		...options,
		accessType: PROPERTY_ACCESS_TYPE.Static,
	});
}

/**
 * プロパティアクセスを検証するバリデータ
 */
function createPropertyValidator(options: PropertyValidatorOptions) {
	const { typeName, constructorTypeName, propertyName, accessType } = options;

	return function create<
		MessageIds extends string,
		Options extends readonly unknown[],
	>(
		context: RuleContext<MessageIds, Options>,
		seed: RuleModuleSeed,
		config: BaselineRuleConfig,
	) {
		const sharedValidator = createSharedValidator(
			typeName,
			constructorTypeName ?? `${typeName}Constructor`,
			context,
			seed,
			config,
		);

		const checkType = (node: TSESTree.Expression) =>
			accessType === PROPERTY_ACCESS_TYPE.Static
				? sharedValidator.validateConstructorType(node)
				: sharedValidator.validateInstanceType(node);

		/**
		 * プロパティアクセスの有効性をチェックし、無効な場合は警告する
		 */

		return {
			// プロパティアクセス (obj.prop, obj?.prop, Constructor.prop)
			MemberExpression(node: TSESTree.MemberExpression) {
				// obj.prop, obj?.prop
				if (
					node.property.type === "Identifier" &&
					node.property.name === propertyName &&
					checkType(node.object)
				) {
					sharedValidator.report(node);
				}
				// obj["prop"]
				else if (
					node.computed &&
					node.property.type === "Literal" &&
					typeof node.property.value === "string" &&
					node.property.value === propertyName &&
					checkType(node.object)
				) {
					sharedValidator.report(node);
				}
				// obj[prop]
				else if (
					node.computed &&
					node.property.type === "Identifier" &&
					sharedValidator.checkIsSpecificLiteral(node.property, propertyName) &&
					checkType(node.object)
				) {
					sharedValidator.report(node);
				}
			},

			// 分割代入 ({ prop } = obj), ({ prop: renamed } = obj), ({ [prop]: renamed }) のチェック
			VariableDeclarator(node: TSESTree.VariableDeclarator) {
				// 分割代入でなかったら早期終了
				if (node.id.type !== "ObjectPattern") {
					return;
				}

				const propertyNode = node.id.properties.find((property) => {
					if (property.type === "RestElement") {
						return false;
					}

					if (property.type === "Property") {
						if (property.key.type === "Identifier") {
							if (property.computed) {
								// const { [prop]: renamed } = obj;
								return sharedValidator.checkIsSpecificLiteral(
									property.key,
									propertyName,
								);
							}
							// const { prop } = obj;
							// const { prop: renamed } = obj;
							return property.key.name === propertyName;
						}
						// const { ["prop"]: renamed } = obj;
						if (property.key.type === "Literal") {
							return property.key.value === propertyName;
						}
					}

					return false;
				});

				if (propertyNode) {
					sharedValidator.report(propertyNode);
				}
			},
		};
	};
}
