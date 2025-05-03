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
