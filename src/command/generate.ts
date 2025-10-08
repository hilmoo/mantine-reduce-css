import path from "node:path";
import { init, parse } from "es-module-lexer";
import fg from "fast-glob";
import { MANTINE_PACKAGE } from "../constant/mantine";
import { Config } from "../lib/config";
import { extractImportsFromFile, getDependencyComponents, sortComponents } from "../lib/component";
import { getCssForComponents } from "../lib/css";
import fs from "fs";

export interface GenerateOptions {
    packageJsonPath: string;
    config: Config;
}

export async function generate(options: GenerateOptions) {
    let css = "";

    const components = await getAllComponents(options.packageJsonPath, options.config);
    const depComponents = getAllDepComponents(components, options.config);
    const allComponents = new Set<string>([...depComponents, ...components]);
    const sortedComponents = sortComponents(allComponents);

    if (options.config.globalCss) {
        css += "@import \"@mantine/core/styles/baseline.css\";\n@import \"@mantine/core/styles/default-css-variables.css\";\n@import \"@mantine/core/styles/global.css\";\n"
    }
    css += getCssForComponents(sortedComponents);

    const outputPath = path.resolve(path.dirname(options.packageJsonPath), options.config.outputPath);
    const outputDir = path.dirname(outputPath);

    try {
        await fs.promises.access(outputDir, fs.constants.F_OK);
        await fs.promises.writeFile(outputPath, css, "utf-8");
        console.log(`Generated CSS with ${allComponents.size} components to ${outputPath}`);
    } catch (err) {
        console.error(`Error: Output directory does not exist: ${outputDir}`);
    }
}

/**
 * Scans project files and generates a set of all imported components from the target package
 */
async function getAllComponents(packageJsonPath: string, config: Config): Promise<Set<string>> {
    await init;

    const projectRoot = path.dirname(packageJsonPath);
    const files = await fg(config.target, { cwd: projectRoot });
    const allComponents = new Set<string>();

    for (const file of files) {
        const filePath = path.join(projectRoot, file);
        const fileComponents = await extractImportsFromFile(
            filePath,
            MANTINE_PACKAGE,
        );

        fileComponents.forEach((component) => allComponents.add(component));
    }

    return allComponents;
}

function getAllDepComponents(components: Set<string>, config: Config) {
    if (config.extensions.CodeHighlight) {
        components.add("@mantine/code-highlight");
    }
    if (config.extensions.NotificationsSystem) {
        components.add("@mantine/notifications");
    }
    if (config.extensions.Spotlight) {
        components.add("@mantine/spotlight");
    }
    if (config.extensions.Carousel) {
        components.add("@mantine/carousel");
    }
    if (config.extensions.Dropzone) {
        components.add("@mantine/dropzone");
    }
    if (config.extensions.NavigationProgress) {
        components.add("@mantine/nprogress");
    }
    if (config.extensions.ModalsManager) {
        components.add("@mantine/modals");
    }
    if (config.extensions.RichTextEditor) {
        components.add("@mantine/tiptap");
    }

    return getDependencyComponents(components);
}