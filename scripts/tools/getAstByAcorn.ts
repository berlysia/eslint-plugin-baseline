import { parse, Parser } from "acorn";
import jsx from "acorn-jsx";
import { parseArgs } from "node:util";

function getAst(code: string) {
	return parse(code, {
		sourceType: "module",
		ecmaVersion: "latest",
	});
}

function getAstWithJsx(code: string) {
	return Parser.extend(jsx()).parse(code, {
		sourceType: "module",
		ecmaVersion: "latest",
	});
}

const options = parseArgs({
	options: {
		jsx: { type: "boolean" },
		code: { type: "string" },
		help: { type: "boolean", short: "h" },
	},
});

if (options.values.help) {
	console.log("Usage: node getAstByAcorn.js --code <code> [--jsx] [--help]");
	console.log("Options:");
	console.log("  --code <code>   The code to parse");
	console.log("  --jsx          Parse JSX code");
	console.log("  --help         Show this help message");
	process.exit(0);
}

if (!options.values.code) {
	throw new Error("Code is required");
}

if (options.values.jsx) {
	console.log(getAstWithJsx(options.values.code));
} else {
	console.log(getAst(options.values.code));
}
