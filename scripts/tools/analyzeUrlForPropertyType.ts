import { spawnSync } from "node:child_process";
import { PROPERTY_ACCESS_TYPE } from "../../src/utils/validators/createPropertyValidator.ts";

/**
 * URLの内容を取得して解析し、プロパティタイプを判定するスクリプト
 *
 * 使用方法:
 * npm run agent:analyze:url -- --mdnUrl <MDN_URL> --specUrl <SPEC_URL>
 */

// コマンドライン引数を解析
const args = process.argv.slice(2);
let mdnUrl: string | undefined;
let specUrl: string | undefined;

for (let i = 0; i < args.length; i++) {
	if (args[i] === "--mdnUrl" && i + 1 < args.length) {
		mdnUrl = args[i + 1];
		i++;
	} else if (args[i] === "--specUrl" && i + 1 < args.length) {
		specUrl = args[i + 1];
		i++;
	}
}

if (!mdnUrl && !specUrl) {
	console.error(
		"使用方法: npm run agent:analyze:url -- --mdnUrl <MDN_URL> --specUrl <SPEC_URL>",
	);
	process.exit(1);
}

/**
 * readabilityを使用してURLの内容を取得する
 */
function fetchUrlContent(url: string): string | null {
	try {
		console.log(`URLから内容を取得中: ${url}`);
		const result = spawnSync("npx", ["@mizchi/readability", url], {
			encoding: "utf8",
			timeout: 10_000, // 10秒でタイムアウト
		});

		if (result.error) {
			console.warn(
				`readabilityの実行中にエラーが発生しました: ${result.error.message}`,
			);
			return null;
		}

		if (result.status !== 0) {
			console.warn(`readabilityが異常終了しました: ${result.stderr}`);
			return null;
		}

		return result.stdout;
	} catch (error) {
		console.warn(`URLの内容取得中にエラーが発生しました: ${error}`);
		return null;
	}
}

/**
 * MDN URLの内容からプロパティタイプを推定する
 */
function analyzeMdnContent(content: string): string | null {
	if (!content) return null;

	// MDN文書の内容に基づく判定
	const lowerContent = content.toLowerCase();

	// インスタンスプロパティの特徴的なパターン
	const instancePatterns = [
		"instance property",
		"prototype property",
		"property of the",
		"of the prototype",
		"read-only property of",
		"getter property of",
		"accessor property of",
	];

	// 静的プロパティの特徴的なパターン
	const staticPatterns = [
		"static property",
		"static method",
		"class property",
		"property of the constructor",
	];

	// インスタンスメソッドの特徴的なパターン
	const instanceMethodPatterns = [
		"instance method",
		"prototype method",
		"method of the",
		"of the prototype",
	];

	// 静的メソッドの特徴的なパターン
	const staticMethodPatterns = [
		"static method",
		"class method",
		"method of the constructor",
	];

	console.log("MDNの内容を解析中...");

	// イディオム別のパターン検出
	for (const pattern of instancePatterns) {
		if (lowerContent.includes(pattern)) {
			console.log(`パターン一致: "${pattern}" -> インスタンスプロパティ`);
			return PROPERTY_ACCESS_TYPE.Instance;
		}
	}

	for (const pattern of staticPatterns) {
		if (lowerContent.includes(pattern)) {
			console.log(`パターン一致: "${pattern}" -> 静的プロパティ`);
			return PROPERTY_ACCESS_TYPE.Static;
		}
	}

	for (const pattern of instanceMethodPatterns) {
		if (lowerContent.includes(pattern)) {
			console.log(`パターン一致: "${pattern}" -> インスタンスメソッド`);
			return PROPERTY_ACCESS_TYPE.Instance;
		}
	}

	for (const pattern of staticMethodPatterns) {
		if (lowerContent.includes(pattern)) {
			console.log(`パターン一致: "${pattern}" -> 静的メソッド`);
			return PROPERTY_ACCESS_TYPE.Static;
		}
	}

	// prototype.が含まれていればインスタンスプロパティ/メソッド
	if (lowerContent.includes("prototype.")) {
		console.log(
			'パターン一致: "prototype." -> インスタンスプロパティ/メソッド',
		);
		return PROPERTY_ACCESS_TYPE.Instance;
	}

	// 特定の要素や見出し内のテキストを抽出して判定
	const syntaxMatch = content.match(
		/<h2[^>]*>構文<\/h2>[\S\s]*?<pre[^>]*>([\S\s]*?)<\/pre>/i,
	);
	if (syntaxMatch && syntaxMatch[1]) {
		const syntax = syntaxMatch[1].toLowerCase();
		if (syntax.includes("prototype") || syntax.includes("new ")) {
			console.log("構文セクションから判定: インスタンスプロパティ/メソッド");
			return PROPERTY_ACCESS_TYPE.Instance;
		}

		if (!syntax.includes("new ") && !syntax.includes("prototype")) {
			console.log("構文セクションから判定: 静的プロパティ/メソッド");
			return PROPERTY_ACCESS_TYPE.Static;
		}
	}

	console.log("MDNの内容からプロパティタイプを判定できませんでした");
	return null;
}

/**
 * spec URLの内容からプロパティタイプを推定する
 */
function analyzeSpecContent(content: string): string | null {
	if (!content) return null;

	const lowerContent = content.toLowerCase();

	console.log("仕様書の内容を解析中...");

	// TC39/ECMAScript仕様書の特徴的なパターン

	// get/set アクセサはほとんどの場合インスタンスプロパティ
	if (
		lowerContent.includes("getownproperty") ||
		lowerContent.includes("get ") ||
		lowerContent.includes("set ")
	) {
		console.log(
			'パターン一致: "get/set/getownproperty" -> インスタンスプロパティ',
		);
		return PROPERTY_ACCESS_TYPE.Instance;
	}

	// prototypeの言及があればインスタンスプロパティ/メソッド
	if (
		lowerContent.includes("prototype.") ||
		lowerContent.includes("prototype[") ||
		lowerContent.includes("prototype object") ||
		lowerContent.includes("instance:")
	) {
		console.log('パターン一致: "prototype" -> インスタンスプロパティ/メソッド');
		return PROPERTY_ACCESS_TYPE.Instance;
	}

	// コンストラクタ関数やクラスそのものの記述であれば静的プロパティ/メソッド
	if (
		lowerContent.includes("constructor function") ||
		lowerContent.includes("constructor:") ||
		lowerContent.includes("class:")
	) {
		console.log('パターン一致: "constructor/class" -> 静的プロパティ/メソッド');
		return PROPERTY_ACCESS_TYPE.Static;
	}

	console.log("仕様書の内容からプロパティタイプを判定できませんでした");
	return null;
}

/**
 * URLからプロパティタイプを推定する
 */
async function analyzeFromUrls(): Promise<void> {
	console.log(`URLからプロパティタイプを推定します:`);
	if (mdnUrl) console.log(`MDN URL: ${mdnUrl}`);
	if (specUrl) console.log(`Spec URL: ${specUrl}`);

	// まずURLパターンから判定（より高速）
	if (
		mdnUrl && // URLに 'prototype' が含まれる場合
		mdnUrl.includes("/prototype/")
	) {
		console.log(
			'MDN URLパターン一致: "/prototype/" -> インスタンスプロパティ/メソッド',
		);
		console.log("結果: instance");
		return;
	}

	if (specUrl) {
		// get/set アクセサの仕様を参照している場合
		if (specUrl.includes("sec-get-") || specUrl.includes("sec-set-")) {
			console.log(
				'Spec URLパターン一致: "sec-get-/sec-set-" -> インスタンスプロパティ',
			);
			console.log("結果: instance");
			return;
		}

		// prototypeの言及がある場合
		if (specUrl.toLowerCase().includes("prototype")) {
			console.log(
				'Spec URLパターン一致: "prototype" -> インスタンスプロパティ/メソッド',
			);
			console.log("結果: instance");
			return;
		}
	}

	// URLのパターンからは判定できない場合、内容を取得して解析
	let result: string | null;

	// MDN URLがある場合、その内容を解析
	if (mdnUrl) {
		const mdnContent = fetchUrlContent(mdnUrl);
		if (mdnContent) {
			result = analyzeMdnContent(mdnContent);
			if (result) {
				console.log(`結果: ${result}`);
				return;
			}
		}
	}

	// Spec URLがある場合、その内容を解析
	if (specUrl) {
		const specContent = fetchUrlContent(specUrl);
		if (specContent) {
			result = analyzeSpecContent(specContent);
			if (result) {
				console.log(`結果: ${result}`);
				return;
			}
		}
	}

	// 判定できなかった場合
	console.log("URLの内容からプロパティタイプを判定できませんでした");
	console.log("結果: 不明");
}

// 解析を実行
try {
	await analyzeFromUrls();
} catch (error) {
	console.error("解析中にエラーが発生しました:", error);
	process.exit(1);
}
