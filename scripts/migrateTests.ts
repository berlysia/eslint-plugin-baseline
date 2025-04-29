import fs from "node:fs/promises";
import path from "node:path";

/**
 * 指定されたパターンに一致するファイルを再帰的に検索します
 * @param dir 検索を開始するディレクトリ
 * @param pattern マッチさせる正規表現パターン
 * @param ignore 除外するパスの配列
 */
async function findFiles(
	dir: string,
	pattern: RegExp,
	ignore: string[] = [],
): Promise<string[]> {
	const files = await fs.readdir(dir, { withFileTypes: true });
	const results = [];

	for (const file of files) {
		const fullPath = path.join(dir, file.name);

		// 除外パターンに一致するかチェック
		if (ignore.some((ignorePattern) => fullPath.includes(ignorePattern))) {
			continue;
		}

		if (file.isDirectory()) {
			const subResults = await findFiles(fullPath, pattern, ignore);
			results.push(...subResults);
		} else if (pattern.test(file.name)) {
			results.push(fullPath);
		}
	}

	return results;
}

/**
 * テストファイルから有効なコードのパターンを抽出します
 * 複数行のコードパターンにも対応
 */
function extractCodePatterns(content: string) {
	// 正規表現を複数用意して、様々なパターンに対応する
	const validCodes = new Set<string>(); // 重複を排除するためにSetを使用
	const validOnlyCodes = new Set<string>(); // validOnly用のコードパターン

	// パターン1: validブロック内のコードを抽出
	const validBlockRegex = /valid:\s*\[\s*{([\S\s]*?)}\s*]/g;
	const validBlocks = [...content.matchAll(validBlockRegex)];

	for (const block of validBlocks) {
		const blockContent = block[1];
		// 各ブロック内でcode: '...' パターンを探す
		const codeRegex =
			/code:\s*["'`]([^]*?)["'`](?=,\s*(?:options|output|errors|only|skip):|,\s*}|}\s*[,\]])/g;
		const codes = [...blockContent.matchAll(codeRegex)];

		for (const codeMatch of codes) {
			const code = codeMatch[1]
				.trim()
				.replaceAll(String.raw`\"`, '"')
				.replaceAll(String.raw`\'`, "'")
				.replaceAll(String.raw`\n`, "\n");

			// コードが有効なJavaScriptに見えるかをチェック
			if (isValidCode(code)) {
				// onlyフラグがある場合はvalidOnlyにする
				if (
					blockContent.includes("only: true") ||
					blockContent.includes('"only": true') ||
					blockContent.includes("'only': true")
				) {
					validOnlyCodes.add(code);
				} else {
					validCodes.add(code);
				}
			}
		}
	}

	// パターン2: 単一のテストケース
	const singleTestRegex =
		/{\s*code:\s*["'`]([^]*?)["'`](?=,\s*(?:options|output|errors|only|skip):|,\s*}|}\s*[,\]])/g;
	const singleTests = [...content.matchAll(singleTestRegex)];

	for (const test of singleTests) {
		const testContent = test[0]; // テストケース全体
		const code = test[1]
			.trim()
			.replaceAll(String.raw`\"`, '"')
			.replaceAll(String.raw`\'`, "'")
			.replaceAll(String.raw`\n`, "\n");

		if (isValidCode(code)) {
			// onlyフラグがある場合はvalidOnlyまたはinvalidOnlyに追加
			if (
				testContent.includes("only: true") ||
				testContent.includes('"only": true') ||
				testContent.includes("'only': true")
			) {
				// invalidブロック内かどうかを確認
				const isInInvalidBlock = (() => {
					const invalidBlockStart = content.lastIndexOf(
						"invalid:",
						content.indexOf(testContent),
					);
					const validBlockStart = content.lastIndexOf(
						"valid:",
						content.indexOf(testContent),
					);

					// invalidブロックがvalidブロックより後にある場合、invalidブロック内と判断
					return invalidBlockStart > validBlockStart;
				})();

				if (!isInInvalidBlock) {
					validOnlyCodes.add(code);
				}
			} else {
				validCodes.add(code);
			}
		}
	}

	// パターン3: invalidOnlyのケースを探す（invalidブロック内で特別にマークされたもの）
	const invalidBlockRegex = /invalid:\s*\[\s*{([\S\s]*?)}\s*]/g;
	const invalidBlocks = [...content.matchAll(invalidBlockRegex)];

	for (const block of invalidBlocks) {
		const blockContent = block[1];
		// 各ブロック内でcode: '...' パターンを探す
		const codeRegex =
			/code:\s*["'`]([^]*?)["'`](?=,\s*(?:options|output|errors|only|skip):|,\s*}|}\s*[,\]])/g;
		const codes = [...blockContent.matchAll(codeRegex)];
	}

	return {
		validCodes: [...validCodes], // Setを配列に変換して返す
		validOnlyCodes: [...validOnlyCodes],
	};
}

/**
 * 抽出されたコードが有効なJavaScriptコードかどうかを簡易的にチェック
 */
function isValidCode(code: string) {
	// 基本的なチェック: コメント行だけではない、括弧の対応が取れているなど
	if (!code || code.trim() === "") return false;

	// コメント行だけのケースを除外
	if (code.trim().startsWith("//")) return false;

	// 明らかに不完全なコード片を除外
	if (code.includes("options:") || code.includes("invalid:")) return false;

	// 括弧やクォートのバランスをチェック
	const brackets = {
		"(": ")",
		"{": "}",
		"[": "]",
		'"': '"',
		"'": "'",
		"`": "`",
	};

	const stack: Array<keyof typeof brackets> = [];
	let inString = null;

	for (let i = 0; i < code.length; i++) {
		const char = code[i];

		// エスケープ文字の処理
		if (char === "\\") {
			i++; // 次の文字をスキップ
			continue;
		}

		if (inString) {
			if (char === inString) {
				inString = null;
			}
			continue;
		}

		if (char === '"' || char === "'" || char === "`") {
			inString = char;
			continue;
		}

		if (Object.keys(brackets).includes(char)) {
			stack.push(char as keyof typeof brackets);
		} else if (Object.values(brackets).includes(char)) {
			const expected = brackets[stack.pop()!];
			if (expected !== char) {
				return false; // 括弧の対応が取れていない
			}
		}
	}

	return stack.length === 0 && inString === null;
}

/**
 * オプションを抽出するヘルパー関数
 */
function extractOptions(content: string) {
	// validオプションを抽出
	const validOptionMatch = content.match(
		/options:\s*\[\s*{\s*asOf:\s*["']([^"']+)["'],\s*support:\s*["']([^"']+)["']/,
	);

	if (!validOptionMatch) {
		return null;
	}

	const validAsOf = validOptionMatch[1];
	const validSupport = validOptionMatch[2];

	// invalidオプションを抽出 (複数の方法を試みる)
	let invalidAsOf = "";
	let invalidSupport = "";

	// 方法1: 明示的なinvalidオプションを探す
	const invalidOptionsMatch = content.match(
		/invalid:[^]*?options:\s*\[\s*{\s*asOf:\s*["']([^"']+)["'],\s*support:\s*["']([^"']+)["']/,
	);
	if (invalidOptionsMatch) {
		invalidAsOf = invalidOptionsMatch[1];
		invalidSupport = invalidOptionsMatch[2];
	}

	// 方法2: すべてのasOf/supportペアを取得して、valid以外のものを使用
	if (!invalidAsOf) {
		const allOptions = [
			...content.matchAll(
				/asOf:\s*["']([^"']+)["'],\s*support:\s*["']([^"']+)["']/g,
			),
		];
		if (allOptions.length > 1) {
			// valid以外の別のオプションを使用
			for (let i = 1; i < allOptions.length; i++) {
				if (
					allOptions[i][1] !== validAsOf ||
					allOptions[i][2] !== validSupport
				) {
					invalidAsOf = allOptions[i][1];
					invalidSupport = allOptions[i][2];
					break;
				}
			}
		}
	}

	// 方法3: messageDataから抽出を試みる
	if (!invalidAsOf) {
		const messageDataMatch = content.match(
			/createMessageData\(seed,\s*{\s*asOf:\s*["']([^"']+)["'],\s*support:\s*["']([^"']+)["']/,
		);
		if (messageDataMatch) {
			invalidAsOf = messageDataMatch[1];
			invalidSupport = messageDataMatch[2];
		}
	}

	// 方法4: デフォルト値を推測する (asOfを前の年に設定)
	if (!invalidAsOf && /^\d{4}-\d{2}-\d{2}$/.test(validAsOf)) {
		const validYear = Number.parseInt(validAsOf.slice(0, 4), 10);
		invalidAsOf = `${validYear - 1}${validAsOf.slice(4)}`;
		invalidSupport = validSupport;
	}

	if (!invalidAsOf) {
		return null;
	}

	return {
		validOption: {
			asOf: validAsOf,
			support: validSupport,
		},
		invalidOption: {
			asOf: invalidAsOf,
			support: invalidSupport,
		},
	};
}

/**
 * テストファイルを新しいシンプルなスタイルに移行するスクリプト
 */
async function main() {
	console.log("🔍 テストファイルを検索中...");

	// テストファイルを検索（既に変換済みのsort.test.tsと、utilsディレクトリを除く）
	const testFiles = await findFiles("test/rules", /\.test\.ts$/, [
		"javascript.builtins.Array.sort.test.ts",
		"utils",
	]);

	console.log(`🔍 ${testFiles.length}個のファイルを処理します`);

	let successes = 0;
	let failures = 0;
	let skipped = 0;

	for (const file of testFiles) {
		try {
			const content = await fs.readFile(file, "utf8");

			// 既にシンプルスタイルに移行済みかチェック
			if (content.includes("createSimpleRuleTest")) {
				console.log(`🔄 ${file} は既に移行済みです`);
				skipped++;
				continue;
			}

			// コードパターンを抽出
			const { validCodes, validOnlyCodes } =
				extractCodePatterns(content);

			if (validCodes.length === 0) {
				console.log(
					`⚠️ ${file} はコードパターンを抽出できないため手動での変換が必要です`,
				);
				failures++;
				continue;
			}

			// オプションを抽出
			const options = extractOptions(content);

			if (!options) {
				console.log(
					`⚠️ ${file} はオプションを抽出できないため手動での変換が必要です`,
				);
				failures++;
				continue;
			}

			// ファイル名から正しいインポートパスを生成
			const baseName = path.basename(file);
			const ruleName = baseName.replace(".test.ts", "");

			// 新しいテストファイルの内容を生成
			const newContent = `import rule, { seed } from "../../src/rules/${ruleName}.ts";
import createSimpleRuleTest from "./utils/createSimpleRuleTest.ts";

createSimpleRuleTest({
\trule,
\tseed,
\tcodes: [
${validCodes.map((code) => `\t\t\`${code.replaceAll("`", "\\`")}\``).join(",\n")}
\t],
${validOnlyCodes.length > 0 ? `\tvalidOnlyCodes: [\n${validOnlyCodes.map((code) => `\t\t\`${code.replaceAll("`", "\\`")}\``).join(",\n")}\n\t],\n` : ""}${invalidOnlyCodes.length > 0 ? `\tvalidOption: {
\t\tasOf: "${options.validOption.asOf}",
\t\tsupport: "${options.validOption.support}",
\t},
\tinvalidOption: {
\t\tasOf: "${options.invalidOption.asOf}",
\t\tsupport: "${options.invalidOption.support}",
\t},
});`;

			// 処理内容をログ出力
			console.log(`処理: ${file}`);
			console.log(`  通常コード数: ${validCodes.length}`);
			if (validOnlyCodes.length > 0) {
				console.log(`  有効のみコード数: ${validOnlyCodes.length}`);
			}
			console.log(
				`  validOption: asOf=${options.validOption.asOf}, support=${options.validOption.support}`,
			);
			console.log(
				`  invalidOption: asOf=${options.invalidOption.asOf}, support=${options.invalidOption.support}`,
			);

			// 新しいコンテンツを書き込み
			await fs.writeFile(file, newContent, "utf8");
			console.log(`✅ ${file} を移行しました`);
			successes++;
		} catch (error) {
			console.error(`❌ ${file} の処理中にエラーが発生しました:`, error);
			failures++;
		}
	}

	console.log("\n🎉 移行完了:");
	console.log(`✅ 成功: ${successes}件`);
	console.log(`🔄 スキップ: ${skipped}件`);
	console.log(`❌ 失敗: ${failures}件`);
}

// スクリプト実行
await main();
