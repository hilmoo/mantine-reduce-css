import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path, { resolve } from "node:path";
import { GenerateCmd } from "../src/command/generate";
import { parseGenerateConfig } from "../src/lib/config";

describe("generate", () => {
    it("should handle simple case", async () => {
        const configPath = path.resolve(__dirname, "test-simple.json");
        const fileContents = fs.readFileSync(configPath, "utf8");
        const configData = JSON.parse(fileContents);
        const config = parseGenerateConfig({ configPath, configData });
        await GenerateCmd({ packageJsonPath: configPath, config });

        const outputPath = path.resolve(
            path.dirname(configPath),
            config.outputPath,
        );
        const generatedCss = fs.readFileSync(outputPath, "utf-8");

        const expectedContent = [
            '@import "@mantine/core/styles/Container.css";',
            '@import "@mantine/core/styles/Divider.css";',
            '@import "@mantine/core/styles/Flex.css";',
            '@import "@mantine/core/styles/Group.css";',
            '@import "@mantine/core/styles/Loader.css";',
            '@import "@mantine/core/styles/Stack.css";',
            '@import "@mantine/core/styles/UnstyledButton.css";',
            '@import "@mantine/core/styles/InlineInput.css";',
            '@import "@mantine/core/styles/Button.css";',
            '@import "@mantine/dates/styles.css";',
            '@import "@mantine/core/styles/Input.css";',
            '@import "@mantine/core/styles/Popover.css";',
            '@import "@mantine/core/styles/Radio.css";',
        ].join("\n");
        expect(generatedCss.trim()).toBe(expectedContent.trim());
    });

    it("should handle folder", async () => {
        const configPath = path.resolve(__dirname, "test-folder.json");
        const fileContents = fs.readFileSync(configPath, "utf8");
        const configData = JSON.parse(fileContents);
        const config = parseGenerateConfig({ configPath, configData });
        await GenerateCmd({ packageJsonPath: configPath, config });

        const outputPath = path.resolve(
            path.dirname(configPath),
            config.outputPath,
        );
        const generatedCss = fs.readFileSync(outputPath, "utf-8");

        const expectedContent = [
            '@import "@mantine/core/styles/baseline.css";',
            '@import "@mantine/core/styles/default-css-variables.css";',
            '@import "@mantine/core/styles/global.css";',
            '@import "@mantine/core/styles/Container.css";',
            '@import "@mantine/core/styles/Divider.css";',
            '@import "@mantine/core/styles/Fieldset.css";',
            '@import "@mantine/core/styles/Flex.css";',
            '@import "@mantine/core/styles/Group.css";',
            '@import "@mantine/core/styles/Loader.css";',
            '@import "@mantine/core/styles/Paper.css";',
            '@import "@mantine/core/styles/Stack.css";',
            '@import "@mantine/core/styles/Text.css";',
            '@import "@mantine/core/styles/Title.css";',
            '@import "@mantine/core/styles/UnstyledButton.css";',
            '@import "@mantine/core/styles/InlineInput.css";',
            '@import "@mantine/core/styles/Button.css";',
            '@import "@mantine/core/styles/ActionIcon.css";',
            '@import "@mantine/core/styles/Input.css";',
            '@import "@mantine/core/styles/Radio.css";'
        ].join("\n");
        expect(generatedCss.trim()).toBe(expectedContent.trim());
    });
});
