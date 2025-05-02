import { transformRuleName } from "../../utils.ts";
import parseYYYYMMDD from "../../../../src/utils/parseYYYYMMDD.ts";
import type { PropertyAccessType } from "../../../../src/utils/validators/createPropertyValidator.ts";
import { PROPERTY_ACCESS_TYPE } from "../../../../src/utils/validators/createPropertyValidator.ts";

/**
 * プロパティとメソッドタイプ情報を含む解析結果
 */
export interface PropertyInfo {
	objectType: string;
	methodName: string;
	methodType: PropertyAccessType;
	compatKey: string;
}

/**
 * テンプレート生成クラス
 */
export class TemplateGenerator {
	/**
	 * オブジェクトメソッド/プロパティルールのコード生成
	 */
	public generateMethodRuleCode(
		propertyInfo: PropertyInfo,
		seed: any,
		validatorName: string,
		validatorImportPath: string,
		validatorOptions: string,
	): string {
		const { objectType, methodName, methodType, compatKey } = propertyInfo;

		return `import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { ${validatorName} } from "${validatorImportPath}";

export const seed = createSeed({
  concern: "${objectType}${methodType === PROPERTY_ACCESS_TYPE.Instance ? ".prototype" : ""}.${methodName}",
  compatKeys: ["${compatKey}"],
  mdnUrl: ${JSON.stringify(seed.bcd?.mdn_url)},
  specUrl: ${JSON.stringify(seed.bcd?.spec_url)},
  newlyAvailableAt: ${JSON.stringify(seed.baseline?.baseline_low_date)},
  widelyAvailableAt: ${JSON.stringify(seed.baseline?.baseline_high_date)},
});

const rule = createRuleV2(
  seed,
  ${validatorName}({${validatorOptions}
  }),
);

export default rule;
`;
	}

	/**
	 * テストファイルのひな形生成
	 */
	public generateTestTemplate(
		propertyInfo: PropertyInfo,
		seed: any,
		validatorName?: string,
	): string | null {
		const { objectType, methodName, methodType } = propertyInfo;
		const isProperty = !methodName.includes("(");
		let testCases = "";

		// 明示的なバリデータの場合はバリデータ名に基づいてサンプルコードを生成
		if (validatorName) {
			if (validatorName.includes("StaticProperty")) {
				testCases = this.generateStaticPropertyTestCases(
					objectType,
					methodName,
				);
			} else if (validatorName.includes("StaticMethod")) {
				testCases = this.generateStaticMethodTestCases(objectType, methodName);
			} else if (validatorName.includes("InstanceProperty")) {
				testCases = this.generateInstancePropertyTestCases(
					objectType,
					methodName,
				);
			} else if (validatorName.includes("InstanceMethod")) {
				testCases = this.generateInstanceMethodTestCases(
					objectType,
					methodName,
				);
			} else if (validatorName.includes("Constructor")) {
				testCases = this.generateConstructorTestCases(objectType);
			}
		}
		// methodTypeに基づいてサンプルコードを生成（従来の方法）
		else {
			// StaticPropertyの場合のサンプルコードを生成
			if (methodType === PROPERTY_ACCESS_TYPE.Static && isProperty) {
				testCases = this.generateStaticPropertyTestCases(
					objectType,
					methodName,
				);
			}
			// StaticMethodの場合のサンプルコードを生成
			else if (methodType === PROPERTY_ACCESS_TYPE.Static && !isProperty) {
				testCases = this.generateStaticMethodTestCases(objectType, methodName);
			}
			// InstancePropertyの場合のサンプルコードを生成
			else if (methodType === PROPERTY_ACCESS_TYPE.Instance && isProperty) {
				testCases = this.generateInstancePropertyTestCases(
					objectType,
					methodName,
				);
			}
			// InstanceMethodの場合のサンプルコードを生成
			else if (methodType === PROPERTY_ACCESS_TYPE.Instance && !isProperty) {
				testCases = this.generateInstanceMethodTestCases(
					objectType,
					methodName,
				);
			}
		}

		// 日付処理を安全に行う
		const { validDate, invalidDate, isWidelyAvailable } =
			this.generateDateConfig(seed);

		// transformedRuleNameを使用してインポートを正しく行う
		const importPath = transformRuleName(propertyInfo.compatKey);

		return `import "./utils/init.ts";
import rule, { seed } from "../../src/rules/${importPath}.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
  rule,
  seed,
  codes: [${testCases}
  ],
  validOption: {
    asOf: "${validDate}",
    support: "${isWidelyAvailable ? "widely" : "newly"}",
  },
  invalidOption: {
    asOf: "${invalidDate}",
    support: "${isWidelyAvailable ? "widely" : "newly"}",
  },
});
`;
	}

	/**
	 * カスタムルールコードを生成する
	 */
	public generateCustomRuleCode(seed: any): string {
		return `
import { computeBaseline } from "compute-baseline";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
  createMessageData,
  createRule,
  createSeed,
} from "../utils/ruleFactory.ts";
import { createIsTargetType } from "../utils/createIsTargetType.ts";

export const seed = createSeed({
  concern: ${JSON.stringify(seed.concern) || "FIXME"},
  compatKeys: ${JSON.stringify(seed.compatKeys) || "[FIXME_COMPATKEY]"},
  mdnUrl: ${JSON.stringify(seed.bcd?.mdn_url) || "FIXME_MDN_URL"},
  specUrl: ${JSON.stringify(seed.bcd?.spec_url) || "FIXME_SPEC_URL"},  
  newlyAvailableAt: ${JSON.stringify(seed.baseline?.baseline_low_date) || "FIXME_NEWLY_DATE"},
  widelyAvailableAt: ${JSON.stringify(seed.baseline?.baseline_high_date) || "FIXME_WIDELY_DATE"},
});

const rule = createRule(seed, {
  create(context) {
    const options = context.options[0] || {};
    const config: BaselineRuleConfig = ensureConfig(options);

    const baseline = computeBaseline({
      compatKeys: seed.compatKeys,
      checkAncestors: true,
    });

    const services = getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    // FIXME: 適切なターゲットタイプ名に変更してください
    const isTargetType = createIsTargetType(typeChecker, "FIXME_OBJECT_TYPE");
    const isTargetConstructorType = createIsTargetType(
      typeChecker,
      "FIXME_CONSTCRUCTOR_TYPE",
      true,
    );

    return {
      // 例: コンストラクタ利用のチェック
      NewExpression(node) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.callee);
        const type = typeChecker.getTypeAtLocation(tsNode);

        if (isTargetType(type)) {
          const isAvailable = checkIsAvailable(config, baseline);

          if (!isAvailable) {
            context.report({
              messageId: "notAvailable",
              node,
              data: createMessageData(seed, config).notAvailable,
            });
          }
        }
      },
      
      // 例: クラス継承のチェック
      "ClassExpression, ClassDeclaration"(
        node: TSESTree.ClassExpression | TSESTree.ClassDeclaration,
      ) {
        if (node.superClass) {
          const tsNode = services.esTreeNodeToTSNodeMap.get(node.superClass);
          const type = typeChecker.getTypeAtLocation(tsNode);

          if (isTargetType(type)) {
            const isAvailable = checkIsAvailable(config, baseline);

            if (!isAvailable) {
              context.report({
                messageId: "notAvailable",
                node,
                data: createMessageData(seed, config).notAvailable,
              });
            }
          }
        }
      },
      
      // 例: メソッドへの参照のチェック
      MemberExpression(node) {
        if (
          node.property.type === "Identifier" &&
          node.property.name === FIXME_METHOD_NAME && // Check if it's a normal instance type
          isTargetType(
            typeChecker.getTypeAtLocation(
              services.esTreeNodeToTSNodeMap.get(node.object),
            ),
          )
        ) {
          const isAvailable = checkIsAvailable(ruleConfig, baseline);

          if (!isAvailable) {
            context.report({
              messageId: "notAvailable",
              node,
              data: createMessageData(seed, ruleConfig).notAvailable,
            });
          }
        } else if (
          // \${ConstructorName}.prototype.\${method}() のようなアクセスパターンをチェック
          node.object.type === "MemberExpression" &&
          isTargetConstructorType(
            typeChecker.getTypeAtLocation(
              services.esTreeNodeToTSNodeMap.get(node.object.object),
            ),
          ) &&
          node.object.property.type === "Identifier" &&
          node.object.property.name === "prototype" &&
          node.property.type === "Identifier" &&
          node.property.name === FIXME_METHOD_NAME
        ) {
          // Check for ObjectType.prototype access pattern
          const isAvailable = checkIsAvailable(ruleConfig, baseline);

          if (!isAvailable) {
            context.report({
              messageId: "notAvailable",
              node,
              data: createMessageData(seed, ruleConfig).notAvailable,
            });
          }
        }
      },
      
      // 例: メソッド呼び出しのチェック
      CallExpression(node) {
        if (node.callee.type === "MemberExpression") {
          const property = node.callee.property;
          if (property.type === "Identifier" && property.name === "FIXME_METHOD_NAME") {
            const objectTsNode = services.esTreeNodeToTSNodeMap.get(node.callee.object);
            const objectType = typeChecker.getTypeAtLocation(objectTsNode);
            
            if (isTargetType(objectType)) {
              const isAvailable = checkIsAvailable(config, baseline);
              
              if (!isAvailable) {
                context.report({
                  messageId: "notAvailable",
                  node,
                  data: createMessageData(seed, config).notAvailable,
                });
              }
            }
          }
        }
      }
    };
  },
});

export default rule;
`;
	}

	/**
	 * 日付設定を安全に生成する
	 */
	private generateDateConfig(seed: any): {
		validDate: string | undefined;
		invalidDate: string | undefined;
		isWidelyAvailable: boolean;
	} {
		const isWidelyAvailable = seed.baseline?.baseline_high_date !== null;

		let validDate: string | undefined;
		let invalidDate: string | undefined;

		try {
			const rawBaseDate = isWidelyAvailable
				? seed.baseline?.baseline_high_date
				: seed.baseline?.baseline_low_date;

			if (rawBaseDate) {
				const baseDate = parseYYYYMMDD(rawBaseDate);
				validDate = baseDate.nextDay().toString();
				invalidDate = baseDate.prevDay().toString();
			} else {
				console.warn(
					`基準日が見つかりません。デフォルトの日付を使用します: ${validDate}/${invalidDate}`,
				);
			}
		} catch (error) {
			console.warn(
				`日付処理中にエラーが発生しました: ${error}. デフォルトの日付を使用します: ${validDate}/${invalidDate}`,
			);
		}

		return { validDate, invalidDate, isWidelyAvailable };
	}

	// 以下、各種テストケースのテンプレート生成関数

	private generateStaticPropertyTestCases(
		objectType: string,
		methodName: string,
	): string {
		return `
    // 基本的な静的プロパティアクセス
    "${objectType}.${methodName};",
    // 計算プロパティによるアクセス
    "${objectType}['${methodName}'];",
    // 変数経由のアクセス
    "const obj = ${objectType}; obj.${methodName};",
    // destructuringによるアクセス
    "const { ${methodName} } = ${objectType};",
    // 変数経由のdestructuringによるアクセス
    "const prop = \\"${methodName}\\"; const { [prop]: renamed } = obj;",
    // リテラル指定でのdestructuringによるアクセス
    "const { [\\"${methodName}\\"]: renamed } = obj;",`;
	}

	private generateStaticMethodTestCases(
		objectType: string,
		methodName: string,
	): string {
		return `
    // 基本的な静的メソッド呼び出し
    "${objectType}.${methodName.replace("()", "")}();",
    // 変数経由の呼び出し
    "const cls = ${objectType}; cls.${methodName.replace("()", "")}();",`;
	}

	private generateInstancePropertyTestCases(
		objectType: string,
		methodName: string,
	): string {
		return `
    // 基本的なインスタンスプロパティアクセス
    "const obj = new ${objectType}(); obj.${methodName};",
    // 計算プロパティによるアクセス
    "const obj = new ${objectType}(); obj[\\"${methodName}\\"];",
    // 変数経由のアクセス
    "const obj = new ${objectType}(); const prop = \\"${methodName}\\"; obj[prop];",
    // destructuringによるアクセス
    "const obj = new ${objectType}(); const { ${methodName} } = obj;",
    // 変数経由のdestructuringによるアクセス
    "const obj = new ${objectType}(); const prop = \\"${methodName}\\"; const { [prop]: renamed } = obj;",
    // リテラル指定でのdestructuringによるアクセス
    "const obj = new ${objectType}(); const { [\\"${methodName}\\"]: renamed } = obj;",`;
	}

	private generateInstanceMethodTestCases(
		objectType: string,
		methodName: string,
	): string {
		return `
    // 基本的なインスタンスメソッド呼び出し
    "const obj = new ${objectType}(); obj.${methodName.replace("()", "")}();",
    // 計算プロパティによる呼び出し
    "const obj = new ${objectType}(); obj[\\"${methodName}\\"]();",
    // 変数経由の呼び出し
    "const obj = new ${objectType}(); obj.${methodName.replace("()", "")}();",
    // 変数経由のdestructuringによる呼び出し
    "const obj = new ${objectType}(); const prop = \\"${methodName}\\"; obj[prop]();",
    // destructuringによる呼び出し
    "const obj = new ${objectType}(); const { ${methodName} } = obj; ${methodName.replace("()", "")}();",
    // リテラル指定でのdestructuringによる呼び出し
    "const obj = new ${objectType}(); const { [\\"${methodName}\\"]: renamed } = obj; renamed();",
    // 変数経由のdestructuringによる呼び出し
    "const obj = new ${objectType}(); const prop = \\"${methodName}\\"; const { [prop]: renamed } = obj; renamed();",
    `;
	}

	private generateConstructorTestCases(objectType: string): string {
		return `
    // 基本的なコンストラクタ使用
    "new ${objectType}();",
`;
	}
}

// シングルトンインスタンスをエクスポート
export const templateGenerator = new TemplateGenerator();
