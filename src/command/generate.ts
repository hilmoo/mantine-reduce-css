import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { MANTINE_PACKAGE } from "../constant";
import componentData from "../data.json";
import {
  extractImportsFromFile,
  getComponentData,
  getDependencyComponents,
  sortComponents,
} from "../lib/component";
import type { GenerateConfig } from "../lib/config";
import { getCssForComponents } from "../lib/css";
import type { Component, ComponentData } from "../types";

interface GenerateOptions {
  packageJsonPath: string;
  config: GenerateConfig;
}

export async function GenerateCmd(options: GenerateOptions) {
  let css = "";
  const mantineComponentMap = new Map(
    componentData.map((c) => [`${c.module}/${c.name}`, c]),
  );
  const componentMap = getComponentData({
    componentMap: mantineComponentMap,
    extendConfig: options.config.extend,
  });

  const components = await getAllComponents(
    options.packageJsonPath,
    options.config,
  );
  const depsComponent = getAllDependencyComponents({
    components,
    config: options.config,
    componentMap,
  });
  const allComponents = new Set<Component>([
    ...depsComponent,
    ...components,
  ]);
  const sortedComponents = sortComponents(allComponents);

  if (options.config.globalCss) {
    css +=
      '@import "@mantine/core/styles/baseline.css";\n@import "@mantine/core/styles/default-css-variables.css";\n@import "@mantine/core/styles/global.css";\n';
  }
  css += getCssForComponents(sortedComponents);

  const outputPath = path.resolve(
    path.dirname(options.packageJsonPath),
    options.config.outputPath!,
  );
  const outputDir = path.dirname(outputPath);

  try {
    await fs.promises.access(outputDir, fs.constants.F_OK);
    await fs.promises.writeFile(outputPath, css, "utf-8");
    console.info(
      `Generated CSS with ${allComponents.size} components to ${outputPath}`,
    );
  } catch {
    console.error(`Error: Output directory does not exist: ${outputDir}`);
  }
}

/**
 * Scans project files and generates a set of all imported components from the target package
 */
async function getAllComponents(
  packageJsonPath: string,
  config: GenerateConfig,
) {
  const projectRoot = path.dirname(packageJsonPath);
  const files = await fg(config.target!, { cwd: projectRoot });
  const allComponents = new Set<Component>();
  const pkgInclude = new Set<string>(MANTINE_PACKAGE);

  if (config.extend) {
    for (const ext of config.extend) {
      pkgInclude.add(ext.package);
    }
  }

  for (const file of files) {
    const filePath = path.join(projectRoot, file);
    const fileComponents = await extractImportsFromFile(filePath, pkgInclude);

    fileComponents.forEach((component) => {
      allComponents.add(component);
    });
  }

  return allComponents;
}

interface getAllDependencyComponentsProps {
  components: Set<Component>;
  config: GenerateConfig;
  componentMap: Map<string, ComponentData>;
}
function getAllDependencyComponents({
  components,
  config,
  componentMap,
}: getAllDependencyComponentsProps) {
  if (config.extensions.CodeHighlight) {
    const pkg = "@mantine/code-highlight";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.NotificationsSystem) {
    const pkg = "@mantine/notifications";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.Spotlight) {
    const pkg = "@mantine/spotlight";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.Carousel) {
    const pkg = "@mantine/carousel";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.Dropzone) {
    const pkg = "@mantine/dropzone";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.NavigationProgress) {
    const pkg = "@mantine/nprogress";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.ModalsManager) {
    const pkg = "@mantine/modals";
    components.add({ name: pkg, module: pkg });
  }
  if (config.extensions.RichTextEditor) {
    const pkg = "@mantine/tiptap";
    components.add({ name: pkg, module: pkg });
  }

  return getDependencyComponents(components, componentMap);
}
