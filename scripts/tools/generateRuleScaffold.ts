import fsp from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { PROPERTY_ACCESS_TYPE } from "../../src/utils/validators/createPropertyValidator.ts";
import type { PropertyAccessType } from "../../src/utils/validators/createPropertyValidator.ts";
import parseYYYYMMDD from "../../src/utils/parseYYYYMMDD.ts";
import { transformRuleName } from "./utils.ts";

const { values: args } = parseArgs({
	options: {
		ruleName: {
			type: "string",
			short: "r",
		},
		methodKind: {
			type: "string",
			short: "k",
		},
	},
});
const ruleName = args.ruleName;
if (!ruleName) {
	throw new Error("Rule name is required");
}
if (
	!args.methodKind ||
	!Object.values(PROPERTY_ACCESS_TYPE).includes(args.methodKind as any)
) {
	throw new Error(
		"Method kind is required and must be one of: Instance, Static",
	);
}
const methodKind = args.methodKind as PropertyAccessType;

const ruleDir = path.join(process.cwd(), "./src/rules");
const seedDir = path.join(process.cwd(), "./src/generated");
const testDir = path.join(process.cwd(), "./test/rules");

// 特殊文字を処理したファイル名
const transformedRuleName = transformRuleName(ruleName);

const rulePath = path.join(ruleDir, `${transformedRuleName}.ts`);
const seedPath = path.join(seedDir, `${ruleName}.json`);
const testPath = path.join(testDir, `${transformedRuleName}.test.ts`);

const seedFile = await fsp.readFile(seedPath);
const seed = JSON.parse(seedFile as unknown as string);

/**
 * ルール名から種類とメソッド名を抽出
 */
function parseRuleName(ruleName: string) {
	const parts = ruleName.split(".");
	if (parts.length < 3) return null;

	const objectType = parts[2]; // 例: Array, String, Map など
	const methodName = parts.at(-1); // 最後の部分がメソッド名

	// メソッドタイプを判定する
	// prototypeが含まれている場合はインスタンスメソッド
	const methodType = parts.includes("prototype")
		? PROPERTY_ACCESS_TYPE.Instance
		: PROPERTY_ACCESS_TYPE.Static;

	return {
		objectType,
		methodName,
		methodType,
		compatKey: ruleName,
	};
}

// この関数は新しい実装では不要なので削除

/**
 * オブジェクトメソッドのルールのコード生成（インスタンス/スタティックを区別した版）
 */
const generateMethodRuleCode = (ruleName: string, seed: any) => {
	const parsedInfo = parseRuleName(ruleName);
	if (!parsedInfo) {
		return null;
	}

	const { objectType, methodName, methodType } = parsedInfo || { objectType: "", methodName: "", methodType: PROPERTY_ACCESS_TYPE.Static };
	if (!objectType || !methodName) {
		return null;
	}

	// 判定方法によってインポート先を変える
	const isMethodOrProperty = methodName.includes("(") ? "Method" : "Property";
	const validatorType = methodKind === PROPERTY_ACCESS_TYPE.Static ? "Static" : "Instance";
	const validatorName = `create${validatorType}${isMethodOrProperty}Validator`;
	
	return `import { createRuleV2, createSeed } from "../utils/ruleFactory.ts";
import { ${validatorName} } from "../utils/validators/create${validatorType}${isMethodOrProperty}Validator.ts";

export const seed = createSeed({
  concern: "${objectType}${methodType === PROPERTY_ACCESS_TYPE.Instance ? ".prototype" : ""}.${methodName}",
  compatKeys: ["${parsedInfo.compatKey}"],
  mdnUrl: ${JSON.stringify(seed.bcd?.mdn_url)},
  specUrl: ${JSON.stringify(seed.bcd?.spec_url)},
  newlyAvailableAt: ${JSON.stringify(seed.baseline.baseline_low_date)},
  widelyAvailableAt: ${JSON.stringify(seed.baseline.baseline_high_date)},
});

const rule = createRuleV2(
  seed,
  ${validatorName}({
    typeName: "${objectType}",
    constructorTypeName: "${objectType}Constructor",
    ${isMethodOrProperty === "Method" ? "methodName" : "propertyName"}: ${JSON.stringify(methodName)},
  }),
);

export default rule;
`;
};

// カスタムルールのコード生成
const ruleCodeBase = `
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
  concern: "FIXME",
  compatKeys: [${JSON.stringify(ruleName)}],
  mdnUrl: ${JSON.stringify(seed.mdn_url)},
  specUrl: ${JSON.stringify(seed.bcd.spec_url)},  
  newlyAvailableAt: ${JSON.stringify(seed.baseline.baseline_low_date)},
  widelyAvailableAt: ${JSON.stringify(seed.baseline.baseline_high_date)},
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

// テストファイルのひな形生成
function generateTestTemplate(ruleName: string, seed: any) {
	const parsedInfo = parseRuleName(ruleName);
	if (!parsedInfo) {
		return null;
	}

	const { objectType, methodName } = parsedInfo || { objectType: "", methodName: "" };
	if (!objectType || !methodName) {
		return null;
	}
	const isProperty = !methodName.includes("(");
	let testCases = "";

	// StaticPropertyの場合のサンプルコードを生成
	if (methodKind === PROPERTY_ACCESS_TYPE.Static && isProperty) {
		testCases = `
    // 基本的な静的プロパティアクセス
    "${objectType}.${methodName};",
    // 計算プロパティによるアクセス
    "${objectType}['${methodName}'];",
    // 変数経由のアクセス
    "const obj = ${objectType}; obj.${methodName};",`;
	}
	// StaticMethodの場合のサンプルコードを生成
	else if (methodKind === PROPERTY_ACCESS_TYPE.Static && !isProperty) {
		testCases = `
    // 基本的な静的メソッド呼び出し
    "${objectType}.${methodName.replace("()", "")}();",
    // 引数ありのメソッド呼び出し
    "${objectType}.${methodName.replace("()", "")}(1, 2);",
    // 変数経由の呼び出し
    "const cls = ${objectType}; cls.${methodName.replace("()", "")}();",`;
	}
	// InstancePropertyの場合のサンプルコードを生成
	else if (methodKind === PROPERTY_ACCESS_TYPE.Instance && isProperty) {
		testCases = `
    // 基本的なインスタンスプロパティアクセス
    "new ${objectType}().${methodName};",
    // 計算プロパティによるアクセス
    "new ${objectType}()['${methodName}'];",
    // 変数経由のアクセス
    "const obj = new ${objectType}(); obj.${methodName};",`;
	}
	// InstanceMethodの場合のサンプルコードを生成
	else if (methodKind === PROPERTY_ACCESS_TYPE.Instance && !isProperty) {
		testCases = `
    // 基本的なインスタンスメソッド呼び出し
    "new ${objectType}().${methodName.replace("()", "")}();",
    // 引数ありのメソッド呼び出し
    "new ${objectType}().${methodName.replace("()", "")}(1, 2);",
    // 変数経由の呼び出し
    "const obj = new ${objectType}(); obj.${methodName.replace("()", "")}();",`;
	}

	const isWidelyAvailable = seed.baseline.baseline_high_date !== null;
	const baseDate = parseYYYYMMDD(
		isWidelyAvailable
			? seed.baseline.baseline_high_date
			: seed.baseline.baseline_low_date,
	);
	const validDate = baseDate.nextDay().toString();
	const invalidDate = baseDate.prevDay().toString();

	// transformedRuleNameを使用してインポートを正しく行う
	const importPath = transformRuleName(ruleName);

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

if (ruleName.startsWith("javascript.builtins.")) {
	// ファクトリー関数を使ったコードの生成を試みる
	const methodRuleCode = generateMethodRuleCode(ruleName, seed);

	// メソッドルールとして認識できた場合はファクトリーを使ったコードを生成
	if (methodRuleCode) {
		await fsp.writeFile(rulePath, methodRuleCode, "utf8");
		console.log(
			`Method rule for ${ruleName} generated using factory at ${rulePath}`,
		);
	} else {
		// それ以外の場合は通常のルールテンプレートを使用
		await fsp.writeFile(rulePath, ruleCodeBase, "utf8");
		console.log(`Rule ${ruleName} scaffold generated at ${rulePath}`);
	}

	const testCode = generateTestTemplate(ruleName, seed);

	if (testCode) {
		await fsp.writeFile(testPath, testCode, "utf8");
		console.log(`Test for ${ruleName} generated at ${testPath}`);
	}
}
