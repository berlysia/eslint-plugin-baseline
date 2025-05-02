/**
 * バリデータのオプションを構築するクラス
 */
export class ValidatorOptionsBuilder {
	/**
	 * バリデータ毎に異なるオプションを構築する
	 */
	public buildValidatorOptions(
		validatorName: string,
		objectType: string,
		methodName: string,
	): string {
		let validatorOptions = "";

		if (validatorName.includes("Constructor")) {
			validatorOptions = this.buildConstructorValidatorOptions(
				objectType,
				validatorName,
			);
		} else if (validatorName.includes("Method")) {
			validatorOptions = this.buildMethodValidatorOptions(
				objectType,
				methodName,
				validatorName,
			);
		} else if (validatorName.includes("Property")) {
			validatorOptions = this.buildPropertyValidatorOptions(
				objectType,
				methodName,
				validatorName,
			);
		}

		return validatorOptions;
	}

	/**
	 * コンストラクタバリデータのオプションを構築
	 */
	private buildConstructorValidatorOptions(
		objectType: string,
		validatorName: string,
	): string {
		let options = `
    typeName: "${objectType}",
    constructorTypeName: "${objectType}Constructor"`;

		if (validatorName.includes("Argument")) {
			options += `,
    argumentIndex: 0 // 適切な引数インデックスに修正してください`;

			if (validatorName.includes("Property")) {
				options += `,
    optionProperty: "property" // 適切なプロパティ名に修正してください`;
			} else if (validatorName.includes("Type")) {
				options += `,
    expectedType: "any" // 適切な型名に修正してください`;
			} else if (validatorName.includes("Pattern")) {
				options += `,
    pattern: /.*/ // 適切なパターンに修正してください`;
			}
		}

		return options;
	}

	/**
	 * メソッドバリデータのオプションを構築
	 */
	private buildMethodValidatorOptions(
		objectType: string,
		methodName: string,
		validatorName: string,
	): string {
		let options = `
    typeName: "${objectType}",
    constructorTypeName: "${objectType}Constructor",
    methodName: ${JSON.stringify(methodName.replace(/\(\)$/, ""))}`;

		if (validatorName.includes("Argument")) {
			options += `,
    argumentIndex: 0 // 適切な引数インデックスに修正してください`;

			if (validatorName.includes("Property")) {
				options += `,
    optionProperty: "property" // 適切なプロパティ名に修正してください`;
			} else if (validatorName.includes("Type")) {
				options += `,
    expectedType: "any" // 適切な型名に修正してください`;
			} else if (validatorName.includes("Pattern")) {
				options += `,
    pattern: /.*/ // 適切なパターンに修正してください`;
			}
		}

		return options;
	}

	/**
	 * プロパティバリデータのオプションを構築
	 */
	private buildPropertyValidatorOptions(
		objectType: string,
		methodName: string,
		validatorName: string,
	): string {
		return validatorName.includes("Static")
			? `
    typeName: "${objectType}",
    constructorTypeName: "${objectType}Constructor",
    propertyName: ${JSON.stringify(methodName.replace(/\(\)$/, ""))}`
			: `
    typeName: "${objectType}",
    propertyName: ${JSON.stringify(methodName.replace(/\(\)$/, ""))}`;
	}
}

// シングルトンインスタンスをエクスポート
export const validatorOptionsBuilder = new ValidatorOptionsBuilder();
