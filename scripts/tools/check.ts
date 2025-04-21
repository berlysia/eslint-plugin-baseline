import fs from "node:fs";
import fsp from "node:fs/promises";
import $ from "dax-sh";

const lintResult = await $`npm run lint:fix`.noThrow();
const testResult = await $`npm run test`.noThrow();
const typecheckResult = await $`npm run typecheck`.noThrow();

if (lintResult.code !== 0) {
	console.error("Linting failed");
}

if (testResult.code !== 0) {
	console.error("Tests failed");
}

if (typecheckResult.code !== 0) {
	console.error("Type checking failed");
}

if (lintResult.code || testResult.code || typecheckResult.code) {
	process.exit(lintResult.code || testResult.code || typecheckResult.code);
}
