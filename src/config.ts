import type { BaselineRuleConfig, PublicBaselineRuleConfig } from "./types.ts";
import formatYYYYMMDD from "./utils/formatYYYYMMDD.ts";

export const defaultConfig: BaselineRuleConfig = {
	asOf: formatYYYYMMDD(new Date()),
	support: "widely",
};

export function ensureConfig(
	config: PublicBaselineRuleConfig,
): BaselineRuleConfig {
	// デフォルト値を適用
	const finalConfig = { ...defaultConfig, ...config };

	// asOfがDate型の場合、YYYY-MM-DD形式の文字列に変換
	if (finalConfig.asOf instanceof Date) {
		finalConfig.asOf = formatYYYYMMDD(finalConfig.asOf);
	}

	// ensure YYYY-MM-DD format
	if (typeof finalConfig.asOf !== "string") {
		throw new Error("asOf must be a string in YYYY-MM-DD format");
	}

	// asOfがYYYY-MM-DD形式でない場合、エラーをスロー
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(finalConfig.asOf)) {
		throw new Error("asOf must be a string in YYYY-MM-DD format");
	}

	// supportがwidelyまたはnewlyでない場合、エラーをスロー
	if (
		finalConfig.support &&
		finalConfig.support !== "widely" &&
		finalConfig.support !== "newly"
	) {
		throw new Error("support must be either 'widely' or 'newly'");
	}

	// supportが指定されていない場合、デフォルト値を適用
	if (!finalConfig.support) {
		finalConfig.support = defaultConfig.support;
	}

	return finalConfig as BaselineRuleConfig;
}
