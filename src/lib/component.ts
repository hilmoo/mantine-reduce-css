import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseSync } from "oxc-parser";
import hierarchy from "../hierarchy.json";
import type { Component, ComponentData } from "../types";
import type { ExtendConfig } from "./config";

/**
 * Analyzes a file's imports and extracts components from the target package
 */
export async function extractImportsFromFile(
  filePath: string,
  targetPackage: Set<string>,
): Promise<Set<Component>> {
  const components = new Set<Component>();

  try {
    const content = await readFile(filePath, "utf-8");
    const filename = path.basename(filePath);

    const result = parseSync(filename, content);

    if (result.program?.body) {
      for (const node of result.program.body) {
        if (
          node.type === "ImportDeclaration" &&
          targetPackage.has(node.source.value)
        ) {
          for (const specifier of node.specifiers) {
            if (
              specifier.type === "ImportSpecifier" ||
              specifier.type === "ImportDefaultSpecifier"
            ) {
              components.add({
                name: specifier.local.name,
                module: node.source.value,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Could not process file: ${filePath}`, error);
  }

  return components;
}

interface getAllDepComponentsProps {
  componentMap: Map<string, ComponentData>;
  extendConfig: ExtendConfig[];
}
export function getComponentData(
  props: getAllDepComponentsProps,
): Map<string, ComponentData> {
  for (const ext of props.extendConfig) {
    try {
      const dataExt = readFileSync(ext.data, "utf-8");
      const extComponents = JSON.parse(dataExt);
      for (const comp of extComponents) {
        if (comp.name && comp.module) {
          props.componentMap.set(`${comp.module}/${comp.name}`, comp);
        }
      }
    } catch (error) {
      console.error(
        `Error parsing extend data for package ${ext.package}:`,
        error,
      );
    }
  }

  return props.componentMap;
}

export function getDependencyComponents(
  components: Set<Component>,
  componentMap: Map<string, ComponentData>,
) {
  const dependencies = new Set<Component>();
  const processed = new Set<string>();

  function addDependencies(module: string, name: string) {
    const key = `${module}/${name}`;
    if (processed.has(key)) return;
    processed.add(key);

    const data = componentMap.get(key);
    if (!data?.dependency) return;

    if (module == name) {
      dependencies.add({ name, module });
    }
    for (const dep of data.dependency) {
      dependencies.add({
        name: dep,
        module: "@mantine/core",
      });
      if (module !== name) {
        addDependencies("@mantine/core", dep);
      }
    }
  }

  for (const { module, name } of components) {
    addDependencies(module, name);
  }

  return dependencies;
}

export function sortComponents(componentSet: Set<Component>): string[] {
  const components = new Set<string>();
  componentSet.forEach((c) => {
    components.add(c.name);
  });
  const orderMap = new Map<string, number>();
  hierarchy.forEach((item, index) => {
    orderMap.set(item, index);
  });

  const componentsArray = [...components];
  componentsArray.sort((a, b) => {
    const indexA = orderMap.get(a) ?? Infinity;
    const indexB = orderMap.get(b) ?? Infinity;

    return indexA - indexB;
  });

  return componentsArray;
}
