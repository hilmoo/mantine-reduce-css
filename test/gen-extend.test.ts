import { it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parseConfig } from "../src/lib/config";
import { GenerateCmd } from "../src/command/generate";
import { ExportCmd } from "../src/command/export";

it("should handle extend config", async () => {
  const configPath = path.resolve(__dirname, "test-gen.json");
  const fileContents = fs.readFileSync(configPath, "utf8");
  const configData = JSON.parse(fileContents);
  const config = parseConfig({ configPath, configData }).genExtend;
  await ExportCmd({ packageJsonPath: configPath, configs: config });

  const configGenPath = path.resolve(__dirname, "test-extend-simple.json");
  const fileGenContents = fs.readFileSync(configGenPath, "utf8");
  const configGenData = JSON.parse(fileGenContents);
  const configGen = parseConfig({
    configPath: configGenPath,
    configData: configGenData,
  });
  await GenerateCmd({ packageJsonPath: configGenPath, config: configGen });

  const outputPath = path.resolve(
    path.dirname(configGenPath),
    configGen.outputPath!,
  );
  const generatedCss = fs.readFileSync(outputPath, "utf-8");

  const expectedContent = [
    '@import "@mantine/core/styles/Container.css";',
    '@import "@mantine/core/styles/Divider.css";',
    '@import "@mantine/core/styles/Flex.css";',
    '@import "@mantine/core/styles/Group.css";',
    '@import "@mantine/core/styles/Loader.css";',
    '@import "@mantine/core/styles/ScrollArea.css";',
    '@import "@mantine/core/styles/SimpleGrid.css";',
    '@import "@mantine/core/styles/Stack.css";',
    '@import "@mantine/core/styles/UnstyledButton.css";',
    '@import "@mantine/core/styles/InlineInput.css";',
    '@import "@mantine/core/styles/Button.css";',
    '@import "@mantine/core/styles/CloseButton.css";',
    '@import "@mantine/dates/styles.css";',
    '@import "@mantine/core/styles/Pill.css";',
    '@import "@mantine/core/styles/Input.css";',
    '@import "@mantine/core/styles/Popover.css";',
    '@import "@mantine/core/styles/Radio.css";',
    '@import "@mantine/core/styles/PillsInput.css";',
    '@import "@mantine/core/styles/Combobox.css";',
  ].join("\n");
  expect(generatedCss.trim()).toBe(expectedContent.trim());
});
