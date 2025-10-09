import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path, { resolve } from "node:path";
import { ExportCmd } from "../src/command/export";
import { ParseExportConfig, parseGenerateConfig } from "../src/lib/config";
import { GenerateCmd } from "../src/command/generate";

describe("export", () => {
    it("should handle export case", async () => {
        const configPath = path.resolve(__dirname, "test-export.json");
        const fileContents = fs.readFileSync(configPath, "utf8");
        const configData = JSON.parse(fileContents);
        const config = ParseExportConfig({ configData });
        await ExportCmd({ packageJsonPath: configPath, config });

        const expectedPath = path.resolve(
            path.dirname(configPath),
            config.outputPath,
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
                    "@mantine/dates/TimePicker"
                ]
            }
        ];
        expect(parsedJson).toEqual(expectedContent);
    });

    it("should handle export-simple case", async () => {
        const configExpPath = path.resolve(__dirname, "test-export.json");
        const fileExpontents = fs.readFileSync(configExpPath, "utf8");
        const configExpData = JSON.parse(fileExpontents);
        const configExp = ParseExportConfig({ configData: configExpData });
        await ExportCmd({ packageJsonPath: configExpPath, config: configExp });

        const configGenPath = path.resolve(__dirname, "test-export-simple.json");
        const fileGenContents = fs.readFileSync(configGenPath, "utf8");
        const configGenData = JSON.parse(fileGenContents);
        const configGen = parseGenerateConfig({ configPath: configGenPath, configData: configGenData });
        await GenerateCmd({ packageJsonPath: configGenPath, config: configGen });

        const outputPath = path.resolve(
            path.dirname(configGenPath),
            configGen.outputPath,
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
            '@import "@mantine/core/styles/Button.css";',
            '@import "@mantine/core/styles/CloseButton.css";',
            '@import "@mantine/dates/styles.css";',
            '@import "@mantine/core/styles/Input.css";',
            '@import "@mantine/core/styles/Pill.css";',
            '@import "@mantine/core/styles/Popover.css";',
            '@import "@mantine/core/styles/Radio.css";',
            '@import "@mantine/core/styles/Combobox.css";',
            '@import "@mantine/core/styles/PillsInput.css";'
        ].join("\n");
        expect(generatedCss.trim()).toBe(expectedContent.trim());
    });
});