import { writeFileSync } from "fs";
import mantineData from "./data.json";
import hierarchy from "./hierarchy.json";

type MantineData = {
  name: string;
  module: string;
  css_name: string;
  dependency: string[];
};

const mantine_top =
  "@import '@mantine/core/styles/baseline.css';\n@import '@mantine/core/styles/default-css-variables.css';\n@import '@mantine/core/styles/global.css';\n";

export function generateCssFiles(
  data: Set<string>,
  outfile: string,
  base: boolean
) {
  const mData = mantineData as MantineData[];
  const hierarchyData = hierarchy as string[];

  // Create a map for quick lookup of component data
  const componentMap = new Map<string, MantineData>();
  mData.forEach((item) => {
    componentMap.set(item.name, item);
  });

  // Create a map for hierarchy positions (lower index = higher priority)
  const hierarchyMap = new Map<string, number>();
  hierarchyData.forEach((item, index) => {
    hierarchyMap.set(item, index);
  });

  // Collect all components and their dependencies
  const allComponents = new Set<string>();

  // Add requested components and their dependencies recursively
  function addComponentAndDependencies(componentName: string) {
    if (allComponents.has(componentName)) return;

    const component = componentMap.get(componentName);
    if (component) {
      allComponents.add(componentName);

      // Add dependencies recursively
      component.dependency.forEach((dep) => {
        addComponentAndDependencies(dep);
      });
    }
  }

  // Process all requested components
  data.forEach((componentName) => {
    addComponentAndDependencies(componentName);
  });

  // Convert to array and sort by hierarchy
  const sortedComponents = Array.from(allComponents).sort((a, b) => {
    const aHierarchy = hierarchyMap.get(a) ?? Number.MAX_SAFE_INTEGER;
    const bHierarchy = hierarchyMap.get(b) ?? Number.MAX_SAFE_INTEGER;
    return aHierarchy - bHierarchy;
  });

  // Generate CSS imports
  const cssImports = sortedComponents
    .map((componentName) => {
      const component = componentMap.get(componentName);
      return component && component.css_name
        ? `@import "${component.css_name}";`
        : null;
    })
    .filter(Boolean);

  const cssContent = cssImports.join("\n");
  if (base) {
    const finalCssContent = mantine_top + cssContent;
    writeFileSync(outfile, finalCssContent);
  } else {
    writeFileSync(outfile, cssContent);
  }

  return cssContent;
}
