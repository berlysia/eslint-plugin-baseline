import fsp from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
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

// 通常のルールのコード生成
const codeForBuiltins = `
import { computeBaseline } from "compute-baseline";
import { ensureConfig } from "../config.ts";
import type { BaselineRuleConfig } from "../types.ts";
import checkIsAvailable from "../utils/checkIsAvailable.ts";
import {
  createMessageData,
  createRule,
  createSeed,
} from "../utils/ruleFactory.ts";
import { getParserServices } from "@typescript-eslint/utils/eslint-utils";
import type { TSESTree } from "@typescript-eslint/typescript-estree";
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
	await fsp.writeFile(rulePath, codeForBuiltins, "utf8");
	await fsp.writeFile(testPath, testTemplate, "utf8");
	console.log(`Rule ${ruleName} scaffold generated at ${rulePath}`);
	console.log(`Test for ${ruleName} generated at ${testPath}`);
}
