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
	 * 仕様URLやMDN URLからプロパティの種類（static/instance）とメソッド/プロパティの判別を推定する
	 */
	private inferPropertyTypeFromUrls(
		specUrl: string | undefined,
		mdnUrl: string | undefined,
	): { accessType: PropertyAccessType | null; isMethod: boolean | null } {
		let accessType: PropertyAccessType | null = null;
		let isMethod: boolean | null = null;

		// 仕様URLから判定
		if (specUrl) {
			// メソッドかプロパティかの判定
			// メソッド判定パターン
			if (specUrl.includes("call") || 
				specUrl.includes("apply") || 
				specUrl.includes("function") || 
				specUrl.includes("method")) {
				isMethod = true;
			}
			// プロパティ判定パターン
			else if (specUrl.includes("sec-get") || 
					specUrl.includes("sec-set") || 
					specUrl.includes("property")) {
				isMethod = false;
			}

			// get/setアクセサはほとんどの場合インスタンスプロパティ
			if (specUrl.includes("sec-get") || specUrl.includes("sec-set")) {
				accessType = PROPERTY_ACCESS_TYPE.Instance;
			}

			// プロトタイプが含まれている場合はインスタンスプロパティ/メソッド
			if (specUrl.toLowerCase().includes("prototype")) {
				accessType = PROPERTY_ACCESS_TYPE.Instance;
			}
		}

		// MDN URLから判定
		if (mdnUrl) {
			const parts = mdnUrl.split("/");
			
			// MDN URLのパターンから判断（例：/ArrayBuffer/prototype/byteLength）
			if (parts.includes("prototype")) {
				accessType = PROPERTY_ACCESS_TYPE.Instance;
			}

			// メソッドかプロパティかの判定：複数の観点から判断
            const lastSegment = parts[parts.length - 1];
            
            // MDNのURLでのメソッド判定パターン
            // 例: URL内に "method" または "function" がある場合
            if (mdnUrl.includes("/method/") || mdnUrl.includes("/function/")) {
                isMethod = true;
            }
            // URLの特定パターン
            else if (mdnUrl.includes("callable")) {
                isMethod = true;
            }
            // プロパティ特有のパターン
            else if (mdnUrl.includes("/property/") || mdnUrl.includes("/attribute/")) {
                isMethod = false;
            }
            // それ以外は名前のパターンから推測
            else {
                // 動詞ベースの判定（メソッドは動詞で始まることが多い）
                const commonVerbPrefixes = [
                    // 作成/変更系
                    "create", "make", "build", "add", "set", "put", "insert", "update", 
                    "remove", "delete", "clear", "reset", "init", "format",
                    // 取得/検索系
                    "get", "fetch", "find", "search", "query", "select", "load", "read",
                    // 変換系
                    "convert", "transform", "parse", "stringify", "serialize", "deserialize",
                    // 検証系
                    "is", "has", "check", "validate", "test", "verify", "ensure",
                    // 実行系
                    "run", "execute", "perform", "do", "apply", "call", "invoke",
                    // 配列系
                    "sort", "map", "filter", "reduce", "forEach", "slice", "splice",
                    "join", "split", "concat", "push", "pop", "shift", "unshift"
                ];
                
                // 接尾辞による判定（特定のパターンで終わる場合）
                const commonVerbSuffixes = ["By", "With", "To", "From", "In", "At", "Async"];
                
                // メソッドらしい接頭辞をチェック
                for (const prefix of commonVerbPrefixes) {
                    if (lastSegment.toLowerCase().startsWith(prefix.toLowerCase())) {
                        isMethod = true;
                        break;
                    }
                }
                
                // 接尾辞による判定（まだ判断できていない場合）
                if (isMethod === null) {
                    for (const suffix of commonVerbSuffixes) {
                        if (lastSegment.endsWith(suffix)) {
                            isMethod = true;
                            break;
                        }
                    }
                }
            }
		}

		return { accessType, isMethod };
	}

	/**
	 * ルール名から種類とメソッド名を抽出し、メソッドかプロパティかも判定する
	 */
	public async detectPropertyType(
		ruleName: string,
		seed?: any,
	): Promise<{
		objectType: string;
		methodName: string;
		methodType: PropertyAccessType;
		compatKey: string;
		isMethod?: boolean; // メソッドかプロパティかを示すフラグを追加
	} | null> {
		const parts = ruleName.split(".");
		if (parts.length < 3) return null;

		const objectType = parts[2]; // 例: Array, String, Map など
		const methodName = parts.at(-1); // 最後の部分がメソッド名
		if (!objectType || !methodName) return null;

		// メソッド名の基本的な判定（後でURLの情報で上書きされる可能性あり）
		let isMethod: boolean | undefined = undefined;

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

			// TODO: メタデータにisMethodフラグを追加することも検討
			return {
				objectType,
				methodName,
				methodType,
				compatKey: ruleName,
				isMethod,
			};
		}

		// 2. seedデータがある場合、URLからプロパティの種類を推定
		if (seed) {
			const specUrl = seed.bcd?.spec_url;
			const mdnUrl = seed.bcd?.mdn_url;

			const inferredInfo = this.inferPropertyTypeFromUrls(specUrl, mdnUrl);
			
			if (inferredInfo.accessType) {
				console.log(
					`URLから推定したプロパティタイプ: ${inferredInfo.accessType} (${ruleName})`,
				);
				
				if (inferredInfo.isMethod !== null) {
					isMethod = inferredInfo.isMethod;
					console.log(
						`URLから推定したメソッド/プロパティ判定: ${isMethod ? "メソッド" : "プロパティ"} (${ruleName})`,
					);
				}

				return {
					objectType,
					methodName,
					methodType: inferredInfo.accessType,
					compatKey: ruleName,
					isMethod,
				};
			}
		}

		// 3. 従来のルール名ベースの判定
		// prototypeが含まれている場合はインスタンスメソッド
		const methodType = parts.includes("prototype")
			? PROPERTY_ACCESS_TYPE.Instance
			: PROPERTY_ACCESS_TYPE.Static;

		// メソッド名自体からの判定（特定の接尾辞/接頭辞を持つ場合）
		if (isMethod === undefined) {
			// 動詞ベースの判定（メソッドは動詞で始まることが多い）
			const commonVerbPrefixes = [
				// 作成/変更系
				"get", "set", "add", "put", "insert", "update", "remove", "delete", 
				"clear", "reset", "create", "make", "build", "init", "format",
				// 取得/検索系
				"fetch", "find", "search", "query", "select", "load", "read",
				// 変換系
				"convert", "transform", "parse", "stringify", 
				// 検証系
				"is", "has", "check", "validate", "test", "verify", "ensure",
				// 実行系
				"run", "execute", "perform", "do", "apply", "call", "invoke",
				// 配列系
				"sort", "map", "filter", "reduce", "forEach", "slice", "splice", 
				"join", "split", "concat", "push", "pop", "shift", "unshift", "reverse"
			];
			
			// メソッドらしい名前のパターンをチェック
			for (const pattern of commonVerbPrefixes) {
				if (methodName.toLowerCase().startsWith(pattern.toLowerCase())) {
					isMethod = true;
					break;
				}
			}
			
			// 接尾辞による判定（まだ判断できていない場合）
			if (isMethod === undefined) {
				const commonVerbSuffixes = ["By", "With", "To", "From", "In", "At", "Async"];
				for (const suffix of commonVerbSuffixes) {
					if (methodName.endsWith(suffix)) {
						isMethod = true;
						break;
					}
				}
			}
		}

		// ルール名からの判定結果を返す
		return {
			objectType,
			methodName,
			methodType,
			compatKey: ruleName,
			isMethod,
		};
	}
}

// シングルトンインスタンスをエクスポート
export const propertyTypeDetector = new PropertyTypeDetector();