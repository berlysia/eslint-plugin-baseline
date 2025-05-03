import { parseArgs } from "node:util";
import { PROPERTY_ACCESS_TYPE } from "../../src/utils/validators/createPropertyValidator.ts";
import { propertyTypeDetector } from "./scaffold/utils/propertyTypeDetector.ts";

/**
 * ルール名からプロパティタイプを検出するコマンドラインツール
 * 用途: スカフォールド生成前に、メソッド/プロパティの種別やアクセスタイプを確認するために使用
 */
async function main() {
	// コマンドライン引数を解析
	const { values: args } = parseArgs({
		options: {
			ruleName: {
				type: "string",
				short: "r",
			},
			seedPath: {
				type: "string",
				short: "s",
			},
		},
	});

	// ルール名の取得と検証
	const ruleName = args.ruleName;
	if (!ruleName) {
		console.error("Error: --ruleName オプションが必要です");
		console.log(
			"Usage: npm run agent:rules:detect -- --ruleName javascript.builtins.Array.at",
		);
		process.exit(1);
	}

	try {
		// シードデータがある場合は読み込む（オプション）
		let seed;
		if (args.seedPath) {
			const fs = await import("node:fs/promises");
			const fileContent = await fs.readFile(args.seedPath);
			seed = JSON.parse(fileContent.toString());
		}

		// プロパティタイプを検出
		const typeInfo = await propertyTypeDetector.detectPropertyType(
			ruleName,
			seed,
		);

		if (!typeInfo) {
			console.error(
				`ルール名 "${ruleName}" からプロパティタイプを検出できませんでした`,
			);
			process.exit(1);
		}

		// 結果を表示
		console.log("\n=== プロパティタイプ検出結果 ===");
		console.log(`ルール名: ${ruleName}`);
		console.log(`オブジェクトタイプ: ${typeInfo.objectType}`);
		console.log(`メソッド/プロパティ名: ${typeInfo.methodName}`);
		console.log(
			`アクセスタイプ: ${typeInfo.methodType === PROPERTY_ACCESS_TYPE.Static ? "Static" : "Instance"}`,
		);
		console.log(
			`メソッド/プロパティ判定: ${typeInfo.isMethod === undefined ? "未確定" : typeInfo.isMethod ? "メソッド" : "プロパティ"}`,
		);
		console.log("");
		console.log(
			"この結果を元にスカフォールドを生成する場合は、以下のコマンドを実行してください:",
		);

		// 適切なバリデータを決定
		const accessType =
			typeInfo.methodType === PROPERTY_ACCESS_TYPE.Static
				? "Static"
				: "Instance";
		const memberType = typeInfo.isMethod === true ? "Method" : "Property";

		console.log(
			`npm run agent:rules:scaffold -- --ruleName ${ruleName} --validator create${accessType}${memberType}Validator`,
		);
		console.log("");
	} catch (error) {
		console.error(`エラーが発生しました: ${error}`);
		process.exit(1);
	}
}

await main();