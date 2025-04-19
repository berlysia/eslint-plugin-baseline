import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	build: {
		emptyOutDir: false,
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"), // Adjust the entry point as needed
			formats: ["es", "cjs"],
			fileName: (format, name) => {
				if (format === "es") {
					return `esm/${name}.js`;
				}
				if (format === "cjs") {
					return `commonjs/${name}.js`;
				}
				throw new Error(`Unconfigured format: ${format}`);
			},
		},
		rollupOptions: {
			output: {
				preserveModules: true,
				exports: "auto",
				inlineDynamicImports: false,
			},
		},
	},
});
