import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export type extractMantineImportsType = {
  directory: string;
  code_highlight: boolean;
  notification: boolean;
  spotlight: boolean;
  carousel: boolean;
  dropzone: boolean;
  nprogress: boolean;
  dates: boolean;
  charts: boolean;
  core: boolean;
  tiptap: boolean;
  extensions: string[];
};
export function extractMantineImports(props: extractMantineImportsType) {
  const allResults = new Set<string>();

  if (props.code_highlight) {
    allResults.add("@mantine/code-highlight");
  }
  if (props.notification) {
    allResults.add("@mantine/notifications");
  }
  if (props.spotlight) {
    allResults.add("@mantine/spotlight");
  }
  if (props.carousel) {
    allResults.add("@mantine/carousel");
  }
  if (props.dropzone) {
    allResults.add("@mantine/dropzone");
  }
  if (props.nprogress) {
    allResults.add("@mantine/nprogress");
  }
  if (props.tiptap) {
    allResults.add("@mantine/tiptap");
  }

  function processDirectory(dir: string, allResults: Set<string>) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        processDirectory(fullPath, allResults);
      } else if (
        entry.isFile() &&
        props.extensions.some((ext) => entry.name.endsWith(ext))
      ) {
        processFile(fullPath, allResults);
      }
    }
  }

  function processFile(filePath: string, allResults: Set<string>) {
    try {
      const content = readFileSync(filePath, "utf8");

      // @mantine/core
      if (props.core) {
        const corePackage =
          /import\s*\{([^}]*)\}\s*from\s*["']@mantine\/core["']/;
        let m;
        if ((m = content.match(corePackage)) !== null) {
          const imports = m[1];
          imports.split(",").forEach((item) => {
            const comp = item.trim().split(" as ")[0];
            if (/^[A-Z][a-zA-Z0-9]+$/.test(comp)) {
              allResults.add(comp);
            }
          });
        }
      }

      // @mantine/dates
      if (props.dates) {
        const corePackage =
          /import\s*\{([^}]*)\}\s*from\s*["']@mantine\/dates["']/;
        let m;
        if ((m = content.match(corePackage)) !== null) {
          const imports = m[1];
          imports.split(",").forEach((item) => {
            const comp = item.trim().split(" as ")[0];
            if (/^[A-Z][a-zA-Z0-9]+$/.test(comp)) {
              allResults.add(comp);
            }
          });
        }
      }

      // @mantine/charts
      if (props.charts) {
        const corePackage =
          /import\s*\{([^}]*)\}\s*from\s*["']@mantine\/charts["']/;
        let m;
        if ((m = content.match(corePackage)) !== null) {
          const imports = m[1];
          imports.split(",").forEach((item) => {
            const comp = item.trim().split(" as ")[0];
            if (/^[A-Z][a-zA-Z0-9]+$/.test(comp)) {
              allResults.add(comp);
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  processDirectory(props.directory, allResults);
  return allResults;
}
