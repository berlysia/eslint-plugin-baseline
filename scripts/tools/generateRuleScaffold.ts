import fsp from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { METHOD_TYPE } from "../../src/utils/createObjectMethodRule.ts";
import type { MethodType } from "../../src/utils/createObjectMethodRule.ts";
import { transformRuleName } from "./utils.ts";

const { values: args } = parseArgs({
	options: {
		ruleName: {
			type: "string",
			short: "r",
		},
	},
});
const ruleName = args.ruleName;
if (!ruleName) {
	throw new Error("Rule name is required");
}
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
		? METHOD_TYPE.Instance
		: METHOD_TYPE.Static;

	return {
		objectType,
		methodName,
		methodType,
		compatKeyPrefix: parts.slice(0, -1).join("."),
	};
}

/**
 * 適切なファクトリ関数名を取得
 */
function getFactoryFunctionName(methodType: MethodType): string | null {
	// 型別ファクトリ関数を削除し、一般的なファクトリ関数に置き換え
	if (methodType === METHOD_TYPE.Instance) {
		return "createInstanceMethodRule";
	}
	return "createStaticMethodRule";
}

/**
 * オブジェクトメソッドのルールのコード生成（インスタンス/スタティックを区別した版）
 */
const generateMethodRuleCode = (ruleName: string, seed: any) => {
	const parsedInfo = parseRuleName(ruleName);
	if (!parsedInfo) {
		return null;
	}

	const { objectType, methodName, methodType } = parsedInfo;

	// 対応するファクトリ関数を選択
	const factoryFunction = getFactoryFunctionName(methodType);
	if (!factoryFunction) {
		// 対応するファクトリ関数がない場合はnullを返す
		return null;
	}

	return `
import { ${factoryFunction} } from "../utils/createObjectMethodRule";

export const { seed, rule } = ${factoryFunction}({
  objectTypeName: "${objectType}",
  methodName: ${JSON.stringify(methodName)},
  compatKeyPrefix: "${parsedInfo.compatKeyPrefix}",
  concern: "${objectType}${methodType === METHOD_TYPE.Instance ? ".prototype" : ""}.${methodName}",
  mdnUrl: ${JSON.stringify(seed.mdn_url)},
  specUrl: ${JSON.stringify(seed.bcd.spec_url)},
  newlyAvailableAt: ${JSON.stringify(seed.baseline.baseline_low_date)},
  widelyAvailableAt: ${JSON.stringify(seed.baseline.baseline_high_date)},
});

export default rule;
`;
};

// カスタムルールのコード生成
const codeForBuiltins = `
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
    const isTargetType = createIsTargetType(typeChecker, "FIXME");

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
const testTemplate = `
import "./init.ts";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule, {
  seed,
} from "../../src/rules/${transformedRuleName}.ts";
import { createMessageData } from "../../src/utils/ruleFactory.ts";

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.ts*"],
      },
      tsconfigRootDir: process.cwd(),
    },
  },
});

tester.run(seed.concern, rule, {
  valid: [
    {
      code: "// FIXME: 有効なコード例",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
    {
      code: "// FIXME: 有効なコード例2",
      options: [{ asOf: "2025-01-01", support: "widely" }],
    },
  ],
  invalid: [
    {
      code: "// FIXME: 無効なコード例",
      options: [{ asOf: "2017-01-01", support: "widely" }],
      errors: [
        {
          messageId: "notAvailable",
          data: createMessageData(seed, {
            asOf: "2017-01-01", 
            support: "widely",
          }).notAvailable,
        },
      ],
    },
    {
      code: "// FIXME: 無効なコード例2",
      options: [{ asOf: "2017-01-01", support: "widely" }],
      errors: [
        {
          messageId: "notAvailable",
          data: createMessageData(seed, {
            asOf: "2017-01-01",
            support: "widely",
          }).notAvailable,
        },
      ],
    },
  ],
});
`;

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
		await fsp.writeFile(rulePath, codeForBuiltins, "utf8");
		console.log(`Rule ${ruleName} scaffold generated at ${rulePath}`);
	}

	await fsp.writeFile(testPath, testTemplate, "utf8");
	console.log(`Test for ${ruleName} generated at ${testPath}`);
}
