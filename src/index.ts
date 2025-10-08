import { cac } from "cac";
import { resolve } from "path";
import { readPackageJSON } from "pkg-types";
import { generate } from "./command/generate";
import { parseConfig } from "./lib/config";

const cli = cac("mantine-reduce-css");

cli.option("--config <path>", "Path to config file", {
	default: "package.json",
});

cli.command("gen [options]", "Generate CSS file").action(async () => {
	const configPath = resolve(process.cwd(), cli.options.config);
	const localPackageJson = await readPackageJSON(configPath);
	const config = parseConfig(localPackageJson);
	await generate({
		packageJsonPath: configPath,
		config: config,
	});
});

cli.parse();
