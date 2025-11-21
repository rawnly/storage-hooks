import { defineConfig } from "tsdown";

export default defineConfig({
	clean: true,
	entry: "./src/index.ts",
	dts: true,
	exports: true,
	format: ["cjs", "esm"],
	external: ["react", "react-dom"],
});
