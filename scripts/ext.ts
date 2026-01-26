import fs from "fs";
import path from "path";
import { ComponentData } from "./type";

function extractDependencyImport(filePath: string): string[] {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");

  // Regex to match the full import line from @mantine/core
  const importPattern =
    /import\s+(?:\{[^}]*\}\s+|[\w*]+(?:\s*,\s*\{[^}]*\})?\s+)?from\s+['"]@mantine\/core['"]/gm;

  // Regex to extract the content inside curly braces { ... }
  const bracesPattern = /import\s+\{([^}]+)\}/;

  const matches: string[] = [];
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    const importClause = match[0];
    const braceMatch = importClause.match(bracesPattern);

    if (braceMatch) {
      const names = braceMatch[1]
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      matches.push(...names);
    }
  }

  return matches;
}

export function flat(
  baseDir: string,
  componentName: string,
  cssName: string,
  nonCore: Set<string>,
): ComponentData[] {
  const absBaseDir = path.resolve(baseDir);
  const componentsDict: Record<string, ComponentData> = {};

  if (!fs.existsSync(absBaseDir)) return [];

  const entries = fs.readdirSync(absBaseDir).sort((a, b) => a.localeCompare(b));

  for (const entry of entries) {
    const fullPath = path.join(absBaseDir, entry);

    if (fs.statSync(fullPath).isDirectory()) {
      const foundFiles: string[] = [];

      const files = fs.readdirSync(fullPath).sort((a, b) => a.localeCompare(b));

      for (const file of files) {
        if (
          file.endsWith(".tsx") &&
          !file.endsWith(".test.tsx") &&
          !file.endsWith(".story.tsx")
        ) {
          foundFiles.push(path.join(fullPath, file));
        }
      }

      if (foundFiles.length === 0) continue;

      const dependencies = new Set<string>();

      for (const tsxPath of foundFiles) {
        const rawDeps = extractDependencyImport(tsxPath);
        rawDeps.forEach((dep) => {
          if (nonCore.has(dep)) {
            dependencies.add(dep);
          }
        });
      }

      if (!componentsDict[componentName]) {
        componentsDict[componentName] = {
          name: componentName,
          module: componentName,
          css_name: cssName,
          dependency: Array.from(dependencies),
        };
      } else {
        const existing = new Set(componentsDict[componentName].dependency);
        dependencies.forEach((d) => existing.add(d));
        componentsDict[componentName].dependency = Array.from(existing);
      }
    }
  }

  return Object.keys(componentsDict)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const comp = componentsDict[key];
      comp.dependency.sort((a, b) => a.localeCompare(b));
      return comp;
    });
}

export function tree(
  baseDir: string,
  lib: string,
  cssName: string,
  nonCore: Set<string>,
): ComponentData[] {
  const absBaseDir = path.resolve(baseDir);
  const componentsDict: Record<string, ComponentData> = {};

  if (!fs.existsSync(absBaseDir)) return [];

  const entries = fs.readdirSync(absBaseDir).sort((a, b) => a.localeCompare(b));

  for (const entry of entries) {
    const fullPath = path.join(absBaseDir, entry);

    if (fs.statSync(fullPath).isDirectory()) {
      const componentName = path.basename(fullPath);
      const tsxPath = path.join(fullPath, `${componentName}.tsx`);

      if (!fs.existsSync(tsxPath) || !fs.statSync(tsxPath).isFile()) {
        continue;
      }

      const rawDeps = extractDependencyImport(tsxPath);
      const dependency = new Set<string>();
      rawDeps.forEach((dep) => {
        if (nonCore.has(dep)) dependency.add(dep);
      });

      if (!componentsDict[componentName]) {
        componentsDict[componentName] = {
          name: componentName,
          module: lib,
          css_name: cssName,
          dependency: Array.from(dependency),
        };
      } else {
        const existing = new Set(componentsDict[componentName].dependency);
        dependency.forEach((d) => existing.add(d));
        componentsDict[componentName].dependency = Array.from(existing);
      }

      const subEntries = fs
        .readdirSync(fullPath)
        .sort((a, b) => a.localeCompare(b));

      for (const subEntry of subEntries) {
        const subPath = path.join(fullPath, subEntry);
        if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
          const subTsxPath = path.join(subPath, `${subEntry}.tsx`);

          if (fs.existsSync(subTsxPath) && fs.statSync(subTsxPath).isFile()) {
            const subDeps = extractDependencyImport(subTsxPath);
            const existing = new Set(componentsDict[componentName].dependency);
            subDeps.forEach((dep) => {
              if (nonCore.has(dep)) existing.add(dep); // Note: Original python logic didn't filter subDeps, but implied it via context. Added safety here.
            });
            componentsDict[componentName].dependency = Array.from(existing);
          }
        }
      }
    }
  }

  return Object.keys(componentsDict)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const comp = componentsDict[key];
      comp.dependency.sort((a, b) => a.localeCompare(b));
      return comp;
    });
}

export function flatTree(
  baseDir: string,
  lib: string,
  cssName: string,
  nonCore: Set<string>,
): ComponentData[] {
  const absBaseDir = path.resolve(baseDir);
  const dependencies = new Set<string>();

  if (!fs.existsSync(absBaseDir)) return [];

  const entries = fs.readdirSync(absBaseDir).sort((a, b) => a.localeCompare(b));

  for (const entry of entries) {
    const fullPath = path.join(absBaseDir, entry);

    if (fs.statSync(fullPath).isDirectory()) {
      const componentName = path.basename(fullPath);
      const tsxPath = path.join(fullPath, `${componentName}.tsx`);

      if (fs.existsSync(tsxPath) && fs.statSync(tsxPath).isFile()) {
        const rawDeps = extractDependencyImport(tsxPath);
        rawDeps.forEach((dep) => {
          if (nonCore.has(dep)) dependencies.add(dep);
        });
      }

      const subEntries = fs
        .readdirSync(fullPath)
        .sort((a, b) => a.localeCompare(b));

      for (const subEntry of subEntries) {
        const subPath = path.join(fullPath, subEntry);
        if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
          const subTsxPath = path.join(subPath, `${subEntry}.tsx`);

          if (fs.existsSync(subTsxPath) && fs.statSync(subTsxPath).isFile()) {
            const subDeps = extractDependencyImport(subTsxPath);
            subDeps.forEach((dep) => {
              if (nonCore.has(dep)) dependencies.add(dep);
            });
          }
        }
      }
    }
  }

  const component: ComponentData = {
    name: lib,
    module: lib,
    css_name: cssName,
    dependency: Array.from(dependencies).sort((a, b) => a.localeCompare(b)),
  };

  return [component];
}
