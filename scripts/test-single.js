// テスト対象の単一ファイルを実行するスクリプト
import { spawn } from "node:child_process";
import path from "node:path";

const testFile = process.argv[2];
if (!testFile) {
	console.error("Test file path required");
	throw new Error("Test file path required");
}

const fullPath = path.resolve(process.cwd(), testFile);
console.log(`Testing: ${fullPath}`);

const child = spawn("node", ["--test-reporter=spec", "--test", fullPath], {
	stdio: "inherit",
});

child.on("close", (code) => {
	process.exit(code);
});
