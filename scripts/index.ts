import fs from "fs";
import path from "path";
import { topologicalSort } from "./gen";
import { flat, flatTree, tree } from "./ext";
import { listMantineComponent } from "./core";
import { fileURLToPath } from "url";

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const parentDir = path.dirname(__dirname);
  const srcDir = path.join(parentDir, "src");
  const mantineRoot = path.join(parentDir, "mantine", "packages", "@mantine");

  const fullComponents: any[] = [];
  const fullHierarchy: string[] = [];

  // ---------------------------------------------------------
  // 1. Mantine Core Components
  // ---------------------------------------------------------
  const coreComponentsDir = path.join(mantineRoot, "core", "src", "components");

  const components = listMantineComponent(
    [
      coreComponentsDir,
      path.join(coreComponentsDir, "Radio"),
      path.join(coreComponentsDir, "Checkbox"),
      path.join(mantineRoot, "core", "src", "utils"),
    ],
    parentDir,
  );
  fullComponents.push(...components);

  const dependencyInjections: Record<string, string[]> = {
    Radio: ["RadioIndicator", "RadioCard"],
    Checkbox: ["CheckboxIndicator", "CheckboxCard"],
  };

  for (const comp of fullComponents) {
    if (dependencyInjections[comp.name]) {
      comp.dependency.push(...dependencyInjections[comp.name]);
      comp.dependency.sort((a: string, b: string) => a.localeCompare(b));
    }
  }

  const nonCore = new Set(fullComponents.map((c) => c.name));

  // ---------------------------------------------------------
  // 3. Mantine Extensions
  // ---------------------------------------------------------

  // Helper to append and keep code DRY
  const addExtensions = (newComps: any[]) => {
    fullComponents.push(...newComps);
  };

  // Dates
  addExtensions(
    tree(
      path.join(mantineRoot, "dates", "src", "components"),
      "@mantine/dates",
      "@mantine/dates/styles.css",
      nonCore,
    ),
  );

  // Charts
  addExtensions(
    tree(
      path.join(mantineRoot, "charts", "src"),
      "@mantine/charts",
      "@mantine/charts/styles.css",
      nonCore,
    ),
  );

  // CodeHighlight
  addExtensions(
    flatTree(
      path.join(mantineRoot, "code-highlight"),
      "@mantine/code-highlight",
      "@mantine/code-highlight/styles.css",
      nonCore,
    ),
  );

  // Notifications
  addExtensions(
    flat(
      path.join(mantineRoot, "notifications"),
      "@mantine/notifications",
      "@mantine/notifications/styles.css",
      nonCore,
    ),
  );

  // Spotlight
  addExtensions(
    flat(
      path.join(mantineRoot, "spotlight"),
      "@mantine/spotlight",
      "@mantine/spotlight/styles.css",
      nonCore,
    ),
  );

  // Carousel
  addExtensions(
    flat(
      path.join(mantineRoot, "carousel"),
      "@mantine/carousel",
      "@mantine/carousel/styles.css",
      nonCore,
    ),
  );

  // Dropzone
  addExtensions(
    flat(
      path.join(mantineRoot, "dropzone"),
      "@mantine/dropzone",
      "@mantine/dropzone/styles.css",
      nonCore,
    ),
  );

  // NavigationProgress
  addExtensions(
    flat(
      path.join(mantineRoot, "nprogress"),
      "@mantine/nprogress",
      "@mantine/nprogress/styles.css",
      nonCore,
    ),
  );

  // ModalsManager
  addExtensions(
    flat(path.join(mantineRoot, "modals"), "@mantine/modals", "", nonCore),
  );

  // Tiptap
  addExtensions(
    flatTree(
      path.join(mantineRoot, "tiptap", "src"),
      "@mantine/tiptap",
      "@mantine/tiptap/styles.css",
      nonCore,
    ),
  );

  // Schedule
  addExtensions(
    tree(
      path.join(mantineRoot, "schedule", "src", "components"),
      "@mantine/schedule",
      "@mantine/schedule/styles.css",
      nonCore,
    ),
  );

  // ---------------------------------------------------------
  // 4. Graph & Topological Sort
  // ---------------------------------------------------------
  const hierarchy = topologicalSort(fullComponents);
  fullHierarchy.push(...hierarchy);

  // ---------------------------------------------------------
  // 5. Write Output
  // ---------------------------------------------------------
  const hierarchyPath = path.join(process.cwd(), "hierarchy.json");
  const dataPath = path.join(process.cwd(), "data.json");

  fs.writeFileSync(
    hierarchyPath,
    JSON.stringify(fullHierarchy, null, 2),
    "utf-8",
  );
  fs.writeFileSync(dataPath, JSON.stringify(fullComponents, null, 2), "utf-8");

  // ---------------------------------------------------------
  // 6. Move Files
  // ---------------------------------------------------------
  const destHierarchy = path.join(srcDir, "hierarchy.json");
  const destData = path.join(srcDir, "data.json");

  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  fs.renameSync(hierarchyPath, destHierarchy);
  fs.renameSync(dataPath, destData);

  console.log("Build complete. Files moved to:", srcDir);
}

main().catch((err) => {
  console.error("Error in build script:", err);
  process.exit(1);
});
