import fsp from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { ruleScaffoldGenerator } from "./scaffold/index.ts";
import { validatorLoader } from "./scaffold/validators/validatorLoader.ts";

// コマンドライン引数を解析
const { values: args } = parseArgs({
	options: {
		ruleName: {
			type: "string",
			short: "r",
		},
		validator: {
			type: "string",
			short: "v",
		},
	},
});

// ルール名の取得と検証
const ruleName = args.ruleName;
if (!ruleName) {
	throw new Error("Rule name is required");
}

// バリデータ設定の読み込み
const validatorsConfig = await validatorLoader.loadValidatorsConfig();
const availableValidators = Object.keys(validatorsConfig);

// バリデータ名の検証
const validatorName = args.validator;
if (validatorName && !availableValidators.includes(validatorName)) {
	console.warn(`指定されたバリデータ '${validatorName}' が見つかりません。`);
	console.log("利用可能なバリデータ:");
	for (const v of availableValidators) {
		console.log(`- ${v} (${validatorsConfig[v].description})`);
	}
	throw new Error("Invalid validator name");
}

// シードファイルの読み込み
const seedDir = path.join(process.cwd(), "./src/generated");
const seedPath = path.join(seedDir, `${ruleName}.json`);
const seedFile = await fsp.readFile(seedPath);
const seed = JSON.parse(seedFile as unknown as string);

// ルールが javascript.builtins で始まる場合はファクトリーを使用
// 通常のルールの場合はカスタムテンプレートを使用
await (ruleName.startsWith("javascript.builtins.")
	? ruleScaffoldGenerator.generateRuleCode(ruleName, seed, validatorName)
	: ruleScaffoldGenerator.generateCustomRuleCode(ruleName, seed));
