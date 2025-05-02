import fsp from "node:fs/promises";
import path from "node:path";
import { PROPERTY_ACCESS_TYPE } from "../../../../src/utils/validators/createPropertyValidator.ts";
import type { PropertyAccessType } from "../../../../src/utils/validators/createPropertyValidator.ts";

/**
 * プロパティの種類を判断するための検出器
 */
export class PropertyTypeDetector {
	/**
	 * メタデータファイルを読み込む関数
	 */
	private async loadPropertyCorrections(): Promise<
		Record<string, { propertyType: string; concern: string; notes?: string }>
	> {
		try {
			const correctionsPath = path.join(
				process.cwd(),
				"scripts/data/property_corrections.json",
			);
			const correctionsContent = await fsp.readFile(correctionsPath);
			return JSON.parse(correctionsContent as unknown as string);
		} catch (error) {
			console.warn(`メタデータファイルの読み込みに失敗しました: ${error}`);
			return {};
		}
	}

	/**
	 * 仕様URLやMDN URLからプロパティの種類を推定する
	 */
	private inferPropertyTypeFromUrls(
		specUrl: string | undefined,
		mdnUrl: string | undefined,
	): PropertyAccessType | null {
		// 仕様URLから判定
		if (specUrl) {
			// get/setアクセサはほとんどの場合インスタンスプロパティ
			if (specUrl.includes("sec-get") || specUrl.includes("sec-set")) {
				return PROPERTY_ACCESS_TYPE.Instance;
			}

			// プロトタイプが含まれている場合はインスタンスプロパティ
			if (specUrl.toLowerCase().includes("prototype")) {
				return PROPERTY_ACCESS_TYPE.Instance;
			}
		}

		// MDN URLから判定
		if (mdnUrl) {
			const parts = mdnUrl.split("/");
			// MDN URLのパターンから判断（例：/ArrayBuffer/prototype/byteLength）
			if (parts.includes("prototype")) {
				return PROPERTY_ACCESS_TYPE.Instance;
			}
		}

		// 判定できない場合はnullを返す
		return null;
	}

	/**
	 * ルール名から種類とメソッド名を抽出
	 */
	public async detectPropertyType(
		ruleName: string,
		seed?: any,
	): Promise<{
		objectType: string;
		methodName: string;
		methodType: PropertyAccessType;
		compatKey: string;
	} | null> {
		const parts = ruleName.split(".");
		if (parts.length < 3) return null;

		const objectType = parts[2]; // 例: Array, String, Map など
		const methodName = parts.at(-1); // 最後の部分がメソッド名
		if (!objectType || !methodName) return null;

		// 1. メタデータファイルでの修正があるかチェック
		const corrections = await this.loadPropertyCorrections();
		const correction = corrections[ruleName];

		if (correction) {
			console.log(
				`メタデータファイルから修正情報を適用: ${ruleName} -> ${correction.propertyType}`,
			);
			const methodType =
				correction.propertyType === "instance"
					? PROPERTY_ACCESS_TYPE.Instance
					: PROPERTY_ACCESS_TYPE.Static;

			return {
				objectType,
				methodName,
				methodType,
				compatKey: ruleName,
			};
		}

		// 2. seedデータがある場合、URLからプロパティの種類を推定
		if (seed) {
			const specUrl = seed.bcd?.spec_url;
			const mdnUrl = seed.bcd?.mdn_url;

			const inferredType = this.inferPropertyTypeFromUrls(specUrl, mdnUrl);
			if (inferredType) {
				console.log(
					`URLから推定したプロパティタイプ: ${inferredType} (${ruleName})`,
				);

				return {
					objectType,
					methodName,
					methodType: inferredType,
					compatKey: ruleName,
				};
			}
		}

		// 3. 従来のルール名ベースの判定
		// prototypeが含まれている場合はインスタンスメソッド
		const methodType = parts.includes("prototype")
			? PROPERTY_ACCESS_TYPE.Instance
			: PROPERTY_ACCESS_TYPE.Static;

		// ルール名からの判定結果を返す
		return {
			objectType,
			methodName,
			methodType,
			compatKey: ruleName,
		};
	}
}

// シングルトンインスタンスをエクスポート
export const propertyTypeDetector = new PropertyTypeDetector();
