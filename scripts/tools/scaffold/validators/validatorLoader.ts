import fsp from "node:fs/promises";
import path from "node:path";

/**
 * バリデータの情報を格納する型
 */
export type ValidatorConfig = Record<
	string,
	{
		file: string;
		path: string;
		description: string;
	}
>;

/**
 * バリデータ設定を読み込むクラス
 */
export class ValidatorLoader {
	/**
	 * バリデータ設定を読み込む関数
	 */
	public async loadValidatorsConfig(): Promise<ValidatorConfig> {
		try {
			// インポートパスを解決
			const validatorsPath = path.join(
				process.cwd(),
				"scripts/tools/validators.json",
			);

			try {
				// 動的インポート（ESM準拠）
				const module = await import(validatorsPath, {
					assert: { type: "json" },
				});
				console.log(
					`バリデータ情報を読み込みました: ${Object.keys(module.default).length} バリデータ`,
				);
				return module.default;
			} catch (importError: unknown) {
				try {
					// 代替方法として、fsを使用してみる
					const validatorsContent = await fsp.readFile(validatorsPath);
					const parsed = JSON.parse(validatorsContent as unknown as string);
					console.log(
						`fsを使用してバリデータ情報を読み込みました: ${Object.keys(parsed).length} バリデータ`,
					);
					return parsed;
				} catch (fsError: unknown) {
					console.warn(
						`バリデータ情報の読み込みに失敗しました: ${(importError as Error).message}, ${(fsError as Error).message}`,
					);
					console.warn(
						"npm run agent:rules:validators を実行して、バリデータ情報を生成してください",
					);
					throw new Error("バリデータ情報の読み込みに失敗しました", {
						cause: new AggregateError(
							[importError, fsError],
							"バリデータ情報の読み込みに失敗しました",
						),
					});
				}
			}
		} catch (error) {
			console.warn(
				`バリデータ情報の読み込み中にエラーが発生しました: ${error}`,
			);
			throw new Error("バリデータ情報の読み込みに失敗しました", {
				cause: error,
			});
		}
	}

	/**
	 * 指定したプロパティタイプとメソッド/プロパティの種類に基づいて、
	 * 適切なバリデータ名を取得する
	 */
	public getValidatorNameForType(isMethod: boolean, isStatic: boolean): string {
		const typePrefix = isStatic ? "Static" : "Instance";
		const typeSuffix = isMethod ? "Method" : "Property";
		return `create${typePrefix}${typeSuffix}Validator`;
	}

	/**
	 * 指定したバリデータ名に対応するインポートパスを取得する
	 */
	public getImportPathForValidator(
		validatorName: string,
		validatorsConfig: ValidatorConfig,
		isMethod: boolean,
		isStatic: boolean,
	): string {
		// 設定からインポートパスを取得
		if (validatorsConfig[validatorName]) {
			const importPath = validatorsConfig[validatorName].path;
			console.log(
				`バリデータ情報から正しいパスを取得: ${validatorName} -> ${importPath}`,
			);
			return importPath;
		}

		// 設定にない場合はデフォルトパスを使用
		const typePrefix = isStatic ? "Static" : "Instance";
		if (!isMethod) {
			// プロパティバリデータはcreatePropertyValidator.tsにある
			return "../utils/validators/createPropertyValidator.ts";
		}
		// メソッドバリデータは専用のファイルにある
		return `../utils/validators/create${typePrefix}${isMethod ? "Method" : "Property"}Validator.ts`;
	}
}

// シングルトンインスタンスをエクスポート
export const validatorLoader = new ValidatorLoader();
