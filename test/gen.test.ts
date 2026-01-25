import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ExportCmd } from "../src/command/export";
import { parseConfig } from "../src/lib/config";
import { GenerateCmd } from "../src/command/generate";

describe("export", () => {
  it("should handle gen case", async () => {
    const configPath = path.resolve(__dirname, "test-gen.json");
    const fileContents = fs.readFileSync(configPath, "utf8");
    const configData = JSON.parse(fileContents);
    const config = parseConfig({ configPath, configData }).genExtend;
    await ExportCmd({ packageJsonPath: configPath, configs: config });

    const expectedPath = path.resolve(
      path.dirname(configPath),
      config[0].outputPath,
    );
    const generatedJson = fs.readFileSync(expectedPath, "utf-8");
    const parsedJson = JSON.parse(generatedJson);
    const expectedContent = [
      {
        name: "CustomButton",
        module: "@test",
        dependency: [
          "@mantine/core/Stack",
          "@mantine/core/Switch",
          "@mantine/core/TagsInput",
          "@mantine/core/TextInput",
          "@mantine/dates/TimePicker",
        ],
      },
    ];
    expect(parsedJson).toEqual(expectedContent);
  });

  it("should handle gen-multi case", async () => {
    const configPath = path.resolve(__dirname, "test-gen-multi.json");
    const fileContents = fs.readFileSync(configPath, "utf8");
    const configData = JSON.parse(fileContents);
    const config = parseConfig({ configPath, configData }).genExtend;
    await ExportCmd({ packageJsonPath: configPath, configs: config });

    const config_1 = config[0];
    const expectedPath_1 = path.resolve(
      path.dirname(configPath),
      config_1.outputPath,
    );
    const generatedJson_1 = fs.readFileSync(expectedPath_1, "utf-8");
    const parsedJson_1 = JSON.parse(generatedJson_1);
    const expectedContent = [
      {
        name: "CustomButton",
        module: "@test-1",
        dependency: [
          "@mantine/core/Stack",
          "@mantine/core/Switch",
          "@mantine/core/TagsInput",
          "@mantine/core/TextInput",
          "@mantine/dates/TimePicker",
        ],
      },
    ];
    expect(parsedJson_1).toEqual(expectedContent);

    const config_2 = config[1];
    const expectedPath_2 = path.resolve(
      path.dirname(configPath),
      config_2.outputPath,
    );
    const generatedJson_2 = fs.readFileSync(expectedPath_2, "utf-8");
    const parsedJson_2 = JSON.parse(generatedJson_2);
    const expectedContent_2 = [
      {
        name: "CustomModal",
        module: "@test-2",
        dependency: ["@mantine/core/Modal", "@mantine/core/Button"],
      },
    ];
    expect(parsedJson_2).toEqual(expectedContent_2);
  });
});
