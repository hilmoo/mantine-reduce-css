import { F_OK } from "node:constants";
import { accessSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { init, parse } from "es-module-lexer";
import fg from "fast-glob";
import { MANTINE_PACKAGE } from "../constant";
import { ExtractFunctionNames } from "../lib/function";
import { GenExtendConfig } from "../lib/config";

interface ExportCmdProps {
  packageJsonPath: string;
  configs: GenExtendConfig[];
}
export async function ExportCmd(props: ExportCmdProps) {
  await init;

  const projectRoot = path.dirname(props.packageJsonPath);

  for (const config of props.configs) {
    const files = await fg(config.target, { cwd: projectRoot });

    const result: Array<{
      name: string;
      module: string;
      dependency: string[];
    }> = [];

    try {
      for (const file of files) {
        const filePath = path.join(projectRoot, file);
        const content = readFileSync(filePath, "utf-8");
        const [imports] = parse(content);

        const dependencies: string[] = [];
        for (const imp of imports) {
          if (imp.n && MANTINE_PACKAGE.has(imp.n)) {
            const statement = content.substring(imp.ss, imp.se);
            const functionNames = ExtractFunctionNames(statement);
            for (const fn of functionNames) {
              dependencies.push(`${imp.n}/${fn}`);
            }
          }
        }

        result.push({
          name: path.basename(file, path.extname(file)),
          module: config.packageName,
          dependency: dependencies,
        });
      }

      const outputPath = path.resolve(
        path.dirname(props.packageJsonPath),
        config.outputPath,
      );
      const outputDir = path.dirname(outputPath);
      accessSync(outputDir, F_OK);
      writeFileSync(outputPath, JSON.stringify(result), "utf-8");
      console.info(`Exported ${result.length} components to ${outputPath}`);
    } catch (error) {
      console.error(`Could not process file: ${props.packageJsonPath}`, error);
    }
  }
}
