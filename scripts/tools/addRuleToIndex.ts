import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");

/**
 * CompatKeyからルール名を生成する
 * @param compatKey - 互換性キー (例: "javascript.builtins.Array.map")
 * @returns - 変換されたルール名
 */
function compatKeyToRuleName(compatKey: string) {
	return compatKey.replaceAll(".", "$");
}

/**
 * CompatKeyからインポートパスを生成する
 * @param compatKey - 互換性キー (例: "javascript.builtins.Array.map")
 * @returns - インポートパス
 */
function compatKeyToImportPath(compatKey: string) {
	// @@iteratorなどの特殊記号を含む場合の処理
	if (compatKey.includes("@@iterator")) {
		return compatKey.replace("@@iterator", "symbolIterator");
	}
	// その他の特殊ケースがあれば追加

	return compatKey;
}

/**
 * インポート変数名を生成する
 * @param compatKey - 互換性キー (例: "javascript.builtins.Array.map")
 * @returns - 変数名
 */
function compatKeyToVariableName(compatKey: string) {
	// 特殊記号を処理
	let varName = compatKey;
	if (varName.includes("@@iterator")) {
		varName = varName.replace("@@iterator", "iterator");
	}

	// ドットをドル記号で区切る
	return `js$${compatKeyToRuleName(varName)}`;
}

/**
 * ルールインデックスファイルにルールを追加する
 * @param compatKey - 追加するルールの互換性キー
 */
async function addRuleToIndex(compatKey: string) {
	try {
		const indexPath = path.join(ROOT_DIR, "src/rules/index.ts");
		const originalContent = await fs.readFile(indexPath, "utf8");

		// 既にルールが存在するか確認
		if (originalContent.includes(`"${compatKey}"`)) {
			console.log(`ルール "${compatKey}" は既にインデックスに存在します。`);
			return;
		}

		// 変数名を生成
		const varName = compatKeyToVariableName(compatKey);
		// インポートパスを生成
		const importPath = compatKeyToImportPath(compatKey);

		// 新しいインポート文
		const newImport = `import ${varName} from "./${importPath}.ts";\n`;

		// 新しいルールの登録
		const ruleEntry = `\t"${compatKey}": ${varName},\n`;

		// インポート文を追加（最後のimport文の後に）
		let updatedContent = originalContent.replaceAll(
			/(import .+ from ".+\.ts";)\n/g,
			(match, p1, offset) => {
				// 最後のインポート文を探す
				const nextChar = originalContent.charAt(offset + match.length);
				if (nextChar !== "i") {
					// 次の文字がimportでなければ、最後のimport
					return `${p1}\n${newImport}`;
				}
				return match;
			},
		);

		// ルールエントリを追加（最後のルールの後に）
		updatedContent = updatedContent.replace(
			/(\t".+": .+,)\n(};)/,
			`$1\n${ruleEntry}$2`,
		);

		// ファイルを更新
		await fs.writeFile(indexPath, updatedContent, "utf8");
		console.log(`ルール "${compatKey}" をインデックスに追加しました。`);
	} catch (error) {
		console.error("エラーが発生しました:", error);
		process.exit(1);
	}
}

async function main() {
	// コマンドライン引数からcompatKeyを取得
	const compatKey = process.argv[2];

	if (!compatKey) {
		console.error("使用方法: node addRuleToIndex.js <compatKey>");
		console.error("例: node addRuleToIndex.js javascript.builtins.Array.map");
		return;
	}

	await addRuleToIndex(compatKey);
}

await main();
