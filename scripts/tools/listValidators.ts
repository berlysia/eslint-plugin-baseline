import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 現在のディレクトリを取得
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

async function extractExportedFunctions(filePath: string): Promise<string[]> {
	const content = await fsp.readFile(filePath, "utf8");

	// 関数のエクスポート宣言を検索する正規表現
	const exportPattern = /export\s+(?:function|const)\s+(\w+)/g;

	// マッチするすべての関数名を取得
	const matches = [...content.matchAll(exportPattern)];
	const exportedFunctions = matches.map((match) => match[1]);

	return exportedFunctions;
}

// 自前のシンプルなglobパターンマッチング関数
async function simpleGlob(pattern: string): Promise<string[]> {
	const validatorsDirPath = path.join(rootDir, "src/utils/validators");

	try {
		const files = await fsp.readdir(validatorsDirPath);
		// .ts拡張子のファイルのみフィルタリング
		const tsFiles = files.filter((file) => file.endsWith(".ts"));

		// フルパスに変換
		return tsFiles.map((file) =>
			path.join(rootDir, "src/utils/validators", file),
		);
	} catch (error) {
		console.error(`Error reading validators directory: ${error}`);
		return [];
	}
}

async function main() {
	// バリデータファイルの検索
	const validatorFiles = await simpleGlob("src/utils/validators/*.ts");

	// 結果を格納するオブジェクト
	const validators: Record<
		string,
		{
			file: string;
			path: string;
			description: string;
		}
	> = {};

	// 各ファイルからエクスポートされた関数を抽出
	for (const file of validatorFiles) {
		const functions = await extractExportedFunctions(file);

		// createXXXValidator パターンに一致する関数のみを抽出
		const validatorFunctions = functions.filter((fn) =>
			fn.match(/^create.*Validator$/),
		);

		// 各バリデータの情報を保存
		for (const fn of validatorFunctions) {
			// ファイル名と関数の関連付け
			const fileName = path.basename(file);
			const importPath = `../utils/validators/${fileName}`;

			// バリデータタイプと対象の推測
			let description: string;

			if (fn.includes("Constructor")) {
				description = "コンストラクタの使用を検証するバリデータ";
			} else if (fn.includes("Static") && fn.includes("Method")) {
				description = "静的メソッドの使用を検証するバリデータ";
			} else if (fn.includes("Instance") && fn.includes("Method")) {
				description = "インスタンスメソッドの使用を検証するバリデータ";
			} else if (fn.includes("Static") && fn.includes("Property")) {
				description = "静的プロパティの使用を検証するバリデータ";
			} else if (fn.includes("Instance") && fn.includes("Property")) {
				description = "インスタンスプロパティの使用を検証するバリデータ";
			} else {
				description = "検証バリデータ";
			}

			validators[fn] = {
				file: fileName,
				path: importPath,
				description,
			};
		}
	}

	// 既知の重複を修正
	if (
		validators.createStaticPropertyValidator &&
		validators.createStaticPropertyValidator.file ===
			"createStaticMethodValidator.ts"
	) {
		validators.createStaticPropertyValidator = {
			file: "createPropertyValidator.ts",
			path: "../utils/validators/createPropertyValidator.ts",
			description: "静的プロパティの使用を検証するバリデータ",
		};
	}

	// 結果を表示
	console.log("利用可能なバリデータ:\n");

	// キー別にソート
	const sortedKeys = Object.keys(validators).sort();

	// テーブル形式で表示
	console.log("| バリデータ名 | 説明 | ファイル |");
	console.log("|------------|------|--------|");

	for (const key of sortedKeys) {
		const { description, file } = validators[key];
		console.log(`| ${key} | ${description} | ${file} |`);
	}

	// JSONとして出力
	const outputPath = path.join(rootDir, "scripts/tools/validators.json");
	await fsp.writeFile(outputPath, JSON.stringify(validators, null, 2));

	console.log(`\nバリデータ情報を ${outputPath} に保存しました`);
}

await main();
