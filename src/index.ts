import fs from "node:fs";
import { resolve } from "node:path";
import { cac } from "cac";
import { generate } from "./command/generate";
import { parseConfig } from "./lib/config";

const cli = cac("mantine-reduce-css");

cli.option("--config <path>", "Path to config file", {
	default: "package.json",
});

cli.command("gen [options]", "Generate CSS file").action(async () => {
	const configPath = resolve(process.cwd(), cli.options.config);
	const configContents = await fs.promises.readFile(configPath, "utf-8");
	const configData = await JSON.parse(configContents);
	const config = parseConfig({ configPath, configData });
	await generate({
		packageJsonPath: configPath,
		config: config,
	});
});

cli.parse();
