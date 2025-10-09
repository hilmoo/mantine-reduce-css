import fs from "node:fs";
import { resolve } from "node:path";
import { cac } from "cac";
import { ExportCmd } from "./command/export";
import { GenerateCmd } from "./command/generate";
import { ParseExportConfig, parseGenerateConfig } from "./lib/config";

const cli = cac("mantine-reduce-css");

cli.option("--config <path>", "Path to config file", {
	default: "package.json",
});

cli.command("[options]", "Generate CSS file").action(async () => {
	const configPath = resolve(process.cwd(), cli.options.config);
	const configContents = await fs.promises.readFile(configPath, "utf-8");
	const configData = await JSON.parse(configContents);
	const config = parseGenerateConfig({ configPath, configData });
	await GenerateCmd({
		packageJsonPath: configPath,
		config: config,
	});
});

cli.command("gen [options]", "Export component data").action(async () => {
	const configPath = resolve(process.cwd(), cli.options.config);
	const configContents = await fs.promises.readFile(configPath, "utf-8");
	const configData = await JSON.parse(configContents);
	const config = ParseExportConfig({ configData });
	await ExportCmd({
		packageJsonPath: configPath,
		config: config,
	});
});

cli.help();

cli.parse();
