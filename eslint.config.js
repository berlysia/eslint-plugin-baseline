import berlysia from "@berlysia/eslint-config";

export default berlysia({
    tsConfigPath: "./tsconfig.json",
}, {
    rules: {
        "max-depth": "off"
    }
});
