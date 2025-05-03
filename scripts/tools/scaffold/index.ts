import fsp from "node:fs/promises";
import path from "node:path";
import { PROPERTY_ACCESS_TYPE } from "../../../src/utils/validators/createPropertyValidator.ts";
import type { PropertyAccessType } from "../../../src/utils/validators/createPropertyValidator.ts";
import { transformRuleName } from "../utils.ts";
import { propertyTypeDetector } from "./utils/propertyTypeDetector.ts";
import { validatorLoader } from "./validators/validatorLoader.ts";
import { templateGenerator } from "./templates/ruleTemplates.ts";
import { validatorOptionsBuilder } from "./utils/validatorOptionsBuilder.ts";

/**
 * ルールのスカフォールドを生成する
 */
export class RuleScaffoldGenerator {
	/**
	 * メソッド/プロパティ用のルールコードを生成する
	 */
	public async generateRuleCode(
		ruleName: string,
		seed: any,
		validatorName?: string,
	): Promise<{ rulePath: string; testPath: string } | null> {
		try {
			// バリデータ情報を読み込む
			const validatorsConfig = await validatorLoader.loadValidatorsConfig();

			// ルール情報を解析
			const parsedInfo = await propertyTypeDetector.detectPropertyType(
				ruleName,
				seed,
			);
			if (!parsedInfo) {
				console.error(`ルール名 "${ruleName}" の解析に失敗しました`);
				return null;
			}

			const { objectType, methodName } = parsedInfo;
			if (!objectType || !methodName) {
				console.error(
					`ルール名 "${ruleName}" からオブジェクトタイプまたはメソッド名の抽出に失敗しました`,
				);
				return null;
			}

			// バリデータの種類と設定を決定
			const ruleCode = await this.buildRuleCode(
				seed,
				parsedInfo,
				validatorName,
				validatorsConfig,
			);

			// テストコードを生成
			const testCode = await this.buildTestCode(
				seed,
				parsedInfo,
				validatorName,
			);

			// ファイルパスを生成
			const transformedRuleName = transformRuleName(ruleName);
			const ruleDir = path.join(process.cwd(), "./src/rules");
			const testDir = path.join(process.cwd(), "./test/rules");
			const rulePath = path.join(ruleDir, `${transformedRuleName}.ts`);
			const testPath = path.join(testDir, `${transformedRuleName}.test.ts`);

			// ファイルに書き込み
			if (ruleCode) {
				await fsp.writeFile(rulePath, ruleCode, "utf8");
				console.log(
					`Method rule for ${ruleName} generated using factory at ${rulePath}`,
				);
			}

			if (testCode) {
				await fsp.writeFile(testPath, testCode, "utf8");
				console.log(`Test for ${ruleName} generated at ${testPath}`);
			}

			return { rulePath, testPath };
		} catch (error) {
			console.error(
				`ルールスカフォールドの生成中にエラーが発生しました: ${error}`,
			);
			return null;
		}
	}

	/**
	 * カスタムルールのコードを生成する
	 */
	public async generateCustomRuleCode(
		ruleName: string,
		seed: any,
	): Promise<{ rulePath: string } | null> {
		try {
			// ファイルパスを生成
			const transformedRuleName = transformRuleName(ruleName);
			const ruleDir = path.join(process.cwd(), "./src/rules");
			const rulePath = path.join(ruleDir, `${transformedRuleName}.ts`);

			// カスタムルールコードを生成
			const ruleCode = templateGenerator.generateCustomRuleCode(seed);

			// ファイルに書き込み
			await fsp.writeFile(rulePath, ruleCode, "utf8");
			console.log(`Custom rule for ${ruleName} generated at ${rulePath}`);

			return { rulePath };
		} catch (error) {
			console.error(`カスタムルールの生成中にエラーが発生しました: ${error}`);
			return null;
		}
	}

	/**
	 * ルールコードを構築する
	 */
	private async buildRuleCode(
		seed: any,
		parsedInfo: {
			objectType: string;
			methodName: string;
			methodType: PropertyAccessType;
			compatKey: string;
			isMethod?: boolean;
		},
		validatorName: string | undefined,
		validatorsConfig: Record<
			string,
			{ file: string; path: string; description: string }
		>,
	): Promise<string | null> {
		const { objectType, methodName, methodType } = parsedInfo;

		// バリデータが明示的に指定されている場合はそれを使用
		let selectedValidatorName;
		let validatorImportPath;
		let validatorOptions;

		// パース結果に基づいてプロパティタイプ（Static/Instance）を取得
		// 明示的に指定されたバリデータがある場合はそれを優先、なければruleName解析結果を使用

		if (validatorName) {
			// 明示的に指定されたバリデータを使用
			selectedValidatorName = validatorName;
			validatorImportPath = validatorsConfig[validatorName].path;
			console.log(
				`指定されたバリデータを使用: ${selectedValidatorName} -> ${validatorImportPath}`,
			);

			// バリデータのオプションを生成
			validatorOptions = validatorOptionsBuilder.buildValidatorOptions(
				validatorName,
				objectType,
				methodName,
			);
		} else {
			// 自動判別：isMethodフラグを使用してメソッドかプロパティかを判定
			// もしisMethodが未定義の場合は、従来のパターンマッチをバックアップとして使用
			let isMethodOrProperty: string;
			if (parsedInfo.isMethod) {
				isMethodOrProperty = parsedInfo.isMethod ? "Method" : "Property";
			} else {
				// 従来のフォールバック方式
				isMethodOrProperty = methodName.includes("(") ? "Method" : "Property";
			}

			// 重要: ここでpropertyAccessTypeを使用して適切なバリデータを選択
			const validatorType =
				methodType === PROPERTY_ACCESS_TYPE.Static ? "Static" : "Instance";

			console.log(
				`プロパティタイプ: ${validatorType}${isMethodOrProperty}, ${methodType}, isMethod: ${parsedInfo.isMethod}`,
			);

			selectedValidatorName = `create${validatorType}${isMethodOrProperty}Validator`;

			// バリデータのインポートパスを取得
			validatorImportPath = validatorLoader.getImportPathForValidator(
				selectedValidatorName,
				validatorsConfig,
				isMethodOrProperty === "Method",
				validatorType === "Static",
			);

			// バリデータのオプションを生成
			validatorOptions = validatorOptionsBuilder.buildValidatorOptions(
				selectedValidatorName,
				objectType,
				methodName,
			);
		}

		// テンプレートを生成
		return templateGenerator.generateMethodRuleCode(
			parsedInfo,
			seed,
			selectedValidatorName,
			validatorImportPath,
			validatorOptions,
		);
	}

	/**
	 * テストコードを構築する
	 */
	private async buildTestCode(
		seed: any,
		parsedInfo: {
			objectType: string;
			methodName: string;
			methodType: PropertyAccessType;
			compatKey: string;
			isMethod?: boolean;
		},
		validatorName: string | undefined,
	): Promise<string | null> {
		// テストテンプレートを生成
		return templateGenerator.generateTestTemplate(
			parsedInfo,
			seed,
			validatorName,
		);
	}
}

// シングルトンインスタンスをエクスポート
export const ruleScaffoldGenerator = new RuleScaffoldGenerator();
