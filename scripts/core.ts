import { ComponentData } from "./type";
import fs from "fs";
import path from "path";

function extractDependencyImport(filePath: string, depth: number): string[] {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  let pattern: RegExp;

  // matches "import ... from '../Component'" or "../../Component"
  if (depth === 1) {
    pattern =
      /import\s+(?:\{[^}]*\}\s+|[\w*]+(?:\s*,\s*\{[^}]*\})?\s+)?from\s+['"]\.\.\/([\w\d_]+)['"]/gm;
  } else if (depth === 2) {
    pattern =
      /import\s+(?:\{[^}]*\}\s+|[\w*]+(?:\s*,\s*\{[^}]*\})?\s+)?from\s+['"]\.\.\/\.\.\/([\w\d_]+)['"]/gm;
  } else {
    return [];
  }

  const matches: string[] = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function hasInlineInput(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, "utf-8");
  return content.includes("from '../../utils/InlineInput';");
}

export function listMantineComponent(
  searchPaths: string[],
  parentDir: string,
): ComponentData[] {
  const componentsDict: Record<string, ComponentData> = {};
  const cssFile = new Set<string>();

  const allJsonPath = path.join(parentDir, "scripts", "all.json");
  if (fs.existsSync(allJsonPath)) {
    const data = JSON.parse(fs.readFileSync(allJsonPath, "utf-8"));
    data.forEach((item: string) => cssFile.add(item));
  }

  const sortedSearchPaths = [...searchPaths].sort();

  for (const rawPath of sortedSearchPaths) {
    const absPath = path.resolve(rawPath);
    if (!fs.existsSync(absPath)) continue;

    const entries = fs.readdirSync(absPath).sort((a, b) => a.localeCompare(b));

    for (const entry of entries) {
      const fullPath = path.join(absPath, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const componentName = path.basename(fullPath);
        let tsxPath = path.join(fullPath, `${componentName}.tsx`);

        if (componentName === "Slider") {
          tsxPath = path.join(fullPath, "Slider", "Slider.tsx");
        }

        if (!fs.existsSync(tsxPath)) {
          continue;
        }

        const dependencies = new Set<string>(
          extractDependencyImport(tsxPath, 1),
        );

        if (hasInlineInput(tsxPath)) {
          dependencies.add("InlineInput");
        }

        let cssName = "";
        if (cssFile.has(componentName)) {
          cssName = `@mantine/core/styles/${componentName}.css`;
        }

        if (!componentsDict[componentName]) {
          componentsDict[componentName] = {
            name: componentName,
            module: "@mantine/core",
            css_name: cssName,
            dependency: Array.from(dependencies),
          };
        } else {
          const existing = new Set(componentsDict[componentName].dependency);
          dependencies.forEach((d) => existing.add(d));
          componentsDict[componentName].dependency = Array.from(existing);
        }

        const subEntries = fs
          .readdirSync(fullPath)
          .sort((a, b) => a.localeCompare(b));

        for (const subEntry of subEntries) {
          const subPath = path.join(fullPath, subEntry);
          if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
            const subTsxPath = path.join(subPath, `${subEntry}.tsx`);
            if (fs.existsSync(subTsxPath)) {
              const subDependencies = extractDependencyImport(subTsxPath, 2);

              const existing = new Set(
                componentsDict[componentName].dependency,
              );
              subDependencies.forEach((d) => existing.add(d));
              componentsDict[componentName].dependency = Array.from(existing);
            }
          }
        }
      }
    }
  }

  const sortedKeys = Object.keys(componentsDict).sort((a, b) =>
    a.localeCompare(b),
  );

  const components: ComponentData[] = sortedKeys.map((key) => {
    const comp = componentsDict[key];
    comp.dependency.sort((a, b) => a.localeCompare(b));
    return comp;
  });

  return components;
}
