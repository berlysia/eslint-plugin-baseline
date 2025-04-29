import fs from "node:fs/promises";
import path from "node:path";
import { glob } from "glob";
import { METHOD_TYPE } from "../src/utils/ruleFactories/createMethodExistenceRule.ts";
import type { MethodType } from "../src/utils/ruleFactories/createMethodExistenceRule.ts";

const RULES_DIR = path.join(process.cwd(), "src/rules");

/**
 * ルール名からオブジェクトタイプ、メソッド名、メソッドタイプを抽出
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
		compatKey: ruleName,
	};
}

/**
 * ファイルの内容からメソッドタイプを判定（インスタンスかスタティックか）
 */
function determineMethodTypeFromContent(fileContent: string): MethodType {
	if (
		fileContent.includes("prototype") &&
		fileContent.includes("concern: `") &&
		fileContent.includes(".prototype.")
	) {
		return METHOD_TYPE.Instance;
	}

	// MemberExpressionのチェックパターンを分析
	const staticMethodPattern =
		/object\.type === "Identifier" && object\.name === /;

	if (staticMethodPattern.test(fileContent)) {
		return METHOD_TYPE.Static;
	}

	// デフォルトはインスタンスメソッド
	return METHOD_TYPE.Instance;
}

/**
 * ファイルの内容からルールのメタデータを抽出
 */
function extractRuleMetadata(fileContent: string) {
	// seed定義からmetadata抽出
	const seedMatch = fileContent.match(
		/export const seed = createSeed\({([\S\s]*?)}\);/,
	);
	if (!seedMatch) return null;

	const seedContent = seedMatch[1];

	// concern を抽出
	const concernMatch = seedContent.match(/concern:\s*["']([^"']+)["']/);
	const concern = concernMatch ? concernMatch[1] : null;

	// compatKeys を抽出
	const compatKeysMatch = seedContent.match(
		/compatKeys:\s*\[\s*["']([^"']+)["']/,
	);
	const compatKey = compatKeysMatch ? compatKeysMatch[1] : null;

	// mdnUrl を抽出
	const mdnUrlMatch = seedContent.match(/mdnUrl:\s*["']([^"']+)["']/);
	const mdnUrl = mdnUrlMatch ? mdnUrlMatch[1] : null;

	// specUrl を抽出
	const specUrlMatch = seedContent.match(/specUrl:\s*["']([^"']+)["']/);
	const specUrl = specUrlMatch ? specUrlMatch[1] : null;

	// newlyAvailableAt を抽出
	const newlyAvailableAtMatch = seedContent.match(
		/newlyAvailableAt:\s*["']([^"']+)["']/,
	);
	const newlyAvailableAt = newlyAvailableAtMatch
		? newlyAvailableAtMatch[1]
		: null;

	// widelyAvailableAt を抽出
	const widelyAvailableAtMatch = seedContent.match(
		/widelyAvailableAt:\s*["']([^"']+)["']/,
	);
	const widelyAvailableAt = widelyAvailableAtMatch
		? widelyAvailableAtMatch[1]
		: null;

	return {
		concern,
		compatKey,
		mdnUrl,
		specUrl,
		newlyAvailableAt,
		widelyAvailableAt,
	};
}

/**
 * ファイルパスからオブジェクトタイプを特定
 */
function determineObjectType(rulePath: string, methodType: MethodType) {
	const filename = path.basename(rulePath);
	const isStatic = methodType === METHOD_TYPE.Static;
	const suffix = isStatic ? "Constructor" : "";

	if (filename.startsWith("javascript.builtins.")) {
		const objectType = filename.split(".")[2];
		return `${objectType}${suffix}`;
	}

	return null;
}

/**
 * 適切なファクトリ関数名を取得
 */
function getFactoryFunctionName(methodType: MethodType): string | null {
	// 型別ファクトリ関数を削除し、一般的なファクトリ関数に置き換え
	if (methodType === METHOD_TYPE.Instance) {
		return "createInstanceMethodExistenceRule";
	}
	return "createStaticMethodExistenceRule";
}

/**
 * ルールファイルを新しいファクトリを使ったバージョンに変換
 */
async function migrateRuleFile(rulePath: string) {
	console.log(`Processing ${rulePath}...`);

	// ファイルの内容を読み込む
	const fileContent = await fs.readFile(rulePath, "utf8");

	// CallExpressionを検出するロジックが含まれているか確認
	const hasCallExpressionCheck =
		fileContent.includes("CallExpression(node)") &&
		(fileContent.includes("MemberExpression") ||
			fileContent.includes("property.type"));

	if (!hasCallExpressionCheck) {
		console.log(`  Skipping: Not a method rule.`);
		return false;
	}

	// メタデータを抽出
	const metadata = extractRuleMetadata(fileContent);
	if (!metadata) {
		console.log(`  Skipping: Could not extract metadata.`);
		return false;
	}

	// メソッドのタイプを判定（インスタンスメソッドかスタティックメソッドか）
	const methodType = determineMethodTypeFromContent(fileContent);
	console.log(`  Detected method type: ${methodType}`);

	// メソッド名を特定
	const filename = path.basename(rulePath);
	const methodNameMatch = filename.match(/\.([^.]+)\.ts$/);
	const methodName = methodNameMatch ? methodNameMatch[1] : null;

	if (!methodName) {
		console.log(`  Skipping: Could not determine method name.`);
		return false;
	}

	// オブジェクトの種類を特定
	const objectType = determineObjectType(rulePath, methodType);
	if (!objectType) {
		console.log(`  Skipping: Could not determine object type.`);
		return false;
	}

	// ファクトリ関数を選択
	const factoryFunction = getFactoryFunctionName(methodType);
	if (!factoryFunction) {
		console.log(
			`  Skipping: Could not determine appropriate factory function.`,
		);
		return false;
	}

	// 新しいコードを生成
	const parts = path.basename(rulePath).split(".");
	const compatKey = parts.slice(0, -1).join(".");
	const concern = `${objectType}${methodType === METHOD_TYPE.Instance ? ".prototype" : ""}.${methodName}`;

	const newCode = `
import { ${factoryFunction} } from "../utils/createObjectMethodRule.ts";

export const { seed, rule } = ${factoryFunction}({
  objectTypeName: "${objectType}",
  methodName: "${methodName}",
  compatKey: "${compatKey}",
  concern: "${concern}",
  mdnUrl: ${metadata.mdnUrl ? `"${metadata.mdnUrl}"` : "undefined"},
  specUrl: ${metadata.specUrl ? `"${metadata.specUrl}"` : "undefined"},
  newlyAvailableAt: ${metadata.newlyAvailableAt ? `"${metadata.newlyAvailableAt}"` : "undefined"},
  widelyAvailableAt: ${metadata.widelyAvailableAt ? `"${metadata.widelyAvailableAt}"` : "undefined"},
});

export default rule;
`;

	// バックアップを作成
	const backupPath = `${rulePath}.bak`;
	await fs.writeFile(backupPath, fileContent);

	// 新しいコードで上書き
	await fs.writeFile(rulePath, newCode);

	console.log(
		`  Success: Migrated to factory pattern using ${factoryFunction}.`,
	);
	return true;
}

/**
 * すべてのルールファイルを変換
 */
async function migrateAllRules() {
	// 対象のオブジェクトメソッドルールを検索
	const ruleFiles = await glob([
		`${RULES_DIR}/javascript.builtins.Array.*.ts`,
		`${RULES_DIR}/javascript.builtins.String.*.ts`,
		`${RULES_DIR}/javascript.builtins.Map.*.ts`,
		`${RULES_DIR}/javascript.builtins.Set.*.ts`,
		`${RULES_DIR}/javascript.builtins.Object.*.ts`,
		`${RULES_DIR}/javascript.builtins.Promise.*.ts`,
	]);

	console.log(`Found ${ruleFiles.length} rule files to process.`);

	let successCount = 0;
	let skippedCount = 0;

	for (const rulePath of ruleFiles) {
		try {
			const success = await migrateRuleFile(rulePath);
			if (success) {
				successCount++;
			} else {
				skippedCount++;
			}
		} catch (error) {
			console.error(`Error processing ${rulePath}:`, error);
			skippedCount++;
		}
	}

	console.log("\n====== Migration Summary ======");
	console.log(`Total rules processed: ${ruleFiles.length}`);
	console.log(`Successfully migrated: ${successCount}`);
	console.log(`Skipped: ${skippedCount}`);
	console.log("==============================\n");
}

/**
 * 既存のルールをテスト変換する（実際の変換はせず、どのルールが対象になるかを確認）
 */
async function dryRunMigration() {
	const ruleFiles = await glob([
		`${RULES_DIR}/javascript.builtins.Array.*.ts`,
		`${RULES_DIR}/javascript.builtins.String.*.ts`,
		`${RULES_DIR}/javascript.builtins.Map.*.ts`,
		`${RULES_DIR}/javascript.builtins.Set.*.ts`,
		`${RULES_DIR}/javascript.builtins.Object.*.ts`,
		`${RULES_DIR}/javascript.builtins.Promise.*.ts`,
	]);

	console.log(`Found ${ruleFiles.length} rule files to analyze.`);

	const eligibleRules: Array<{ file: string; type: string }> = [];
	const ineligibleRules: string[] = [];

	for (const rulePath of ruleFiles) {
		try {
			// ファイルの内容を読み込む
			const fileContent = await fs.readFile(rulePath, "utf8");

			// 変換対象かどうかを判定
			const hasCallExpressionCheck =
				fileContent.includes("CallExpression(node)") &&
				(fileContent.includes("MemberExpression") ||
					fileContent.includes("property.type"));

			const metadata = extractRuleMetadata(fileContent);
			const methodType = determineMethodTypeFromContent(fileContent);
			const objectType = determineObjectType(rulePath, methodType);

			const filename = path.basename(rulePath);

			if (hasCallExpressionCheck && metadata && objectType) {
				const methodType = determineMethodTypeFromContent(fileContent);
				eligibleRules.push({
					file: filename,
					type:
						methodType === METHOD_TYPE.Instance
							? "Instance Method"
							: "Static Method",
				});
			} else {
				ineligibleRules.push(filename);
			}
		} catch (error) {
			console.error(`Error analyzing ${rulePath}:`, error);
			ineligibleRules.push(path.basename(rulePath));
		}
	}

	// インスタンスメソッドとスタティックメソッドで分類
	const instanceMethods = eligibleRules.filter(
		(r) => r.type === "Instance Method",
	);
	const staticMethods = eligibleRules.filter((r) => r.type === "Static Method");

	console.log("\n====== Dry Run Analysis ======");
	console.log(`Total rules analyzed: ${ruleFiles.length}`);
	console.log(`Eligible for migration: ${eligibleRules.length}`);
	console.log(`   - Instance methods: ${instanceMethods.length}`);
	console.log(`   - Static methods: ${staticMethods.length}`);
	console.log(`Not eligible for migration: ${ineligibleRules.length}`);

	if (instanceMethods.length > 0) {
		console.log("\nEligible instance methods:");
		for (const rule of instanceMethods) console.log(`  - ${rule.file}`);
	}

	if (staticMethods.length > 0) {
		console.log("\nEligible static methods:");
		for (const rule of staticMethods) console.log(`  - ${rule.file}`);
	}

	if (ineligibleRules.length > 0) {
		console.log("\nIneligible rules:");
		for (const rule of ineligibleRules) console.log(`  - ${rule}`);
	}

	console.log("==============================\n");
}

/**
 * 単一のルールを変換
 */
async function migrateSpecificRule(ruleName: string) {
	const rulePath = path.join(RULES_DIR, `${ruleName}`);

	console.log(`Attempting to migrate specific rule: ${rulePath}`);

	try {
		const success = await migrateRuleFile(rulePath);

		if (success) {
			console.log(`Successfully migrated ${ruleName}`);
		} else {
			console.log(`Rule ${ruleName} is not eligible for migration.`);
		}
	} catch (error) {
		console.error(`Error migrating ${ruleName}:`, error);
	}
}

/**
 * ルールスケルトンの生成（既存のスクリプトの拡張版）
 */
async function generateRuleScaffold(ruleName: string, seedPath: string) {
	if (!ruleName) {
		throw new Error("Rule name is required");
	}

	const ruleDir = path.join(process.cwd(), "./src/rules");

	// 整形されたファイル名
	const transformedRuleName = ruleName.replaceAll(/[^\w.]/g, "_");

	const rulePath = path.join(ruleDir, `${transformedRuleName}.ts`);

	// シードファイルからメタデータを読み込む
	const seedFile = await fs.readFile(seedPath);
	const seed = JSON.parse(seedFile as unknown as string);

	// ルール名から種類を抽出
	const parsedInfo = parseRuleName(ruleName);
	if (!parsedInfo) {
		throw new Error("Could not parse rule name");
	}

	const { objectType, methodName, methodType } = parsedInfo;

	// ファクトリ関数を選択
	const factoryFunction = getFactoryFunctionName(methodType);
	if (!factoryFunction) {
		throw new Error(
			`Unsupported object type or method type: ${objectType}, ${methodType}`,
		);
	}

	// ルールコードの生成
	const concern = `${objectType}${methodType === METHOD_TYPE.Instance ? ".prototype" : ""}.${methodName}`;

	const ruleCode = `
import { ${factoryFunction} } from "../utils/createObjectMethodRule";

export const { seed, rule } = ${factoryFunction}({
  objectTypeName: "${objectType}",
  methodName: "${methodName}",
  compatKey: "${parsedInfo.compatKey}",
  concern: "${concern}",
  mdnUrl: ${seed.mdn_url ? `"${seed.mdn_url}"` : "undefined"},
  specUrl: ${seed.bcd.spec_url ? `"${seed.bcd.spec_url}"` : "undefined"},
  newlyAvailableAt: ${seed.baseline.baseline_low_date ? `"${seed.baseline.baseline_low_date}"` : "undefined"},
  widelyAvailableAt: ${seed.baseline.baseline_high_date ? `"${seed.baseline.baseline_high_date}"` : "undefined"},
});

export default rule;
`;

	// ファイルに書き込み
	await fs.writeFile(rulePath, ruleCode, "utf8");

	console.log(`Rule scaffold for ${ruleName} generated at ${rulePath}`);
	return rulePath;
}

/**
 * メイン実行関数
 */
async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	switch (command) {
		case "dry-run": {
			await dryRunMigration();
			break;
		}

		case "migrate-all": {
			await migrateAllRules();
			break;
		}

		case "migrate-rule": {
			const ruleName = args[1];
			if (!ruleName) {
				console.error("Error: Rule name is required for migrate-rule command.");
				process.exit(1);
			}
			await migrateSpecificRule(ruleName);
			break;
		}

		case "generate-rule": {
			const newRuleName = args[1];
			const seedPath = args[2];
			if (!newRuleName || !seedPath) {
				console.error(
					"Error: Rule name and seed path are required for generate-rule command.",
				);
				process.exit(1);
			}
			await generateRuleScaffold(newRuleName, seedPath);
			break;
		}

		default: {
			console.log(`
Migration and scaffold utility for eslint-plugin-baseline rules.

Usage:
  node migrateToFactory.js [command]

Commands:
  dry-run         Analyze rules without modifying them
  migrate-all     Migrate all eligible rules to the factory pattern
  migrate-rule    Migrate a specific rule (provide rule filename as argument)
                  Example: node migrateToFactory.js migrate-rule javascript.builtins.Array.map.ts
  generate-rule   Generate a new rule using factory pattern (provide rule name and seed path)
                  Example: node migrateToFactory.js generate-rule javascript.builtins.Array.from 
                  ./src/generated/javascript.builtins.Array.from.json
      `);
			break;
		}
	}
}

// スクリプト実行
await main();
