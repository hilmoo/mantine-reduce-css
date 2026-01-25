import fs from "node:fs";
import { resolve } from "node:path";
import { cac } from "cac";
import { version } from "../package.json";
import { ExportCmd } from "./command/export";
import { GenerateCmd } from "./command/generate";
import { parseConfig } from "./lib/config";

const cli = cac("mantine-reduce-css");

cli.option("--config <path>", "Path to config file", {
  default: "package.json",
});

cli.command("[options]", "Generate CSS file").action(async () => {
  const configPath = resolve(process.cwd(), cli.options.config);
  const configContents = await fs.promises.readFile(configPath, "utf-8");
  const configData = await JSON.parse(configContents);
  const config = parseConfig({ configPath, configData });
  await GenerateCmd({
    packageJsonPath: configPath,
    config: config,
  });
});

cli.command("gen [options]", "Export component data").action(async () => {
  const configPath = resolve(process.cwd(), cli.options.config);
  const configContents = await fs.promises.readFile(configPath, "utf-8");
  const configData = await JSON.parse(configContents);
  const config = parseConfig({ configPath, configData }).genExtend;
  if (!config) {
    throw new Error("No 'genExtend' configuration found for export command");
  }
  await ExportCmd({
    packageJsonPath: configPath,
    configs: config,
  });
});

cli.help();

cli.version(version);

cli.parse();
