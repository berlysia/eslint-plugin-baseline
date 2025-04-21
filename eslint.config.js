import { globalIgnores } from "eslint/config";
import berlysia from "@berlysia/eslint-config";

export default berlysia({
    tsConfigPath: "./tsconfig.json",
}, {
    linterOptions: {
        reportUnusedDisableDirectives: "off"
    },
    rules: {
        "max-depth": "off"
    }
}, globalIgnores([".tshy-build"]),
    {
        files: ["scripts/**/*.ts"],
        rules: {
            "unicorn/no-process-exit": "off",
        }
    });
