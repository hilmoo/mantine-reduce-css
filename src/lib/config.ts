import fs from "node:fs";
import path from "node:path";

interface ExtensionsConfig {
  CodeHighlight: boolean;
  NotificationsSystem: boolean;
  Spotlight: boolean;
  Carousel: boolean;
  Dropzone: boolean;
  NavigationProgress: boolean;
  ModalsManager: boolean;
  RichTextEditor: boolean;
  Schedule: boolean;
}

export interface ExtendConfig {
  package: string;
  data: string;
}

export interface GenExtendConfig {
  target: string[];
  outputPath: string;
  packageName: string;
}

export type GenerateConfig =
  | {
      target: string[];
      globalCss: boolean;
      outputPath: string;
      extensions: ExtensionsConfig;
      extend: ExtendConfig[];
      genExtend: GenExtendConfig[];
    }
  | {
      target?: string[];
      globalCss?: boolean;
      outputPath?: string;
      extensions: ExtensionsConfig;
      extend: ExtendConfig[];
      genExtend: GenExtendConfig[];
    };

const defaultExtensions: ExtensionsConfig = {
  CodeHighlight: false,
  NotificationsSystem: false,
  Spotlight: false,
  Carousel: false,
  Dropzone: false,
  NavigationProgress: false,
  ModalsManager: false,
  RichTextEditor: false,
  Schedule: false,
};

interface parseConfigProps {
  configPath: string;
  configData: {
    [key: string]: unknown;
  };
}

export function parseConfig({
  configPath,
  configData,
}: parseConfigProps): GenerateConfig {
  const mantineReduceCss = configData.mantineReduceCss;

  if (!mantineReduceCss || typeof mantineReduceCss !== "object") {
    throw new Error(
      "Missing or invalid 'mantineReduceCss' configuration in package.json",
    );
  }

  const config = mantineReduceCss as {
    target?: unknown;
    outputPath?: unknown;
    globalCss?: unknown;
    extensions?: unknown;
    extend?: unknown;
    genExtend?: unknown;
  };

  let extendArr: ExtendConfig[] = [];
  if (config.extend) {
    if (!Array.isArray(config.extend)) {
      throw new Error(
        "'extend' must be an array in 'mantineReduceCss' configuration",
      );
    }

    extendArr = config.extend.map((ext: any) => {
      if (!ext.data || typeof ext.data !== "string") {
        throw new Error("'extend.data' must be a string path");
      }
      const resolvedPath = path.resolve(path.dirname(configPath), ext.data);

      if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
        throw new Error(
          `'extend.data' must be a valid file path: ${resolvedPath}`,
        );
      }
      return { ...ext, data: resolvedPath };
    });
  }

  const extensions = (config.extensions as Partial<ExtensionsConfig>) || {};
  const mergedExtensions: ExtensionsConfig = {
    ...defaultExtensions,
    ...extensions,
  };

  const globalCss = (config.globalCss as boolean) ?? true;

  if (config.genExtend) {
    if (!Array.isArray(config.genExtend)) {
      throw new Error(
        "'genExtend' must be an array in 'mantineReduceCss' configuration",
      );
    }

    const genExtendArr: GenExtendConfig[] = config.genExtend.map(
      (genExt: any) => {
        if (
          !genExt.target ||
          !Array.isArray(genExt.target) ||
          genExt.target.length === 0
        ) {
          throw new Error("'genExtend.target' must be a non-empty array");
        }
        if (!genExt.packageName || typeof genExt.packageName !== "string") {
          throw new Error("'genExtend.packageName' must be a non-empty string");
        }
        if (!genExt.outputPath || typeof genExt.outputPath !== "string") {
          throw new Error("'genExtend.outputPath' must be a non-empty string");
        }
        return genExt as GenExtendConfig;
      },
    );

    // Optional validations for target/outputPath in this mode
    const target = Array.isArray(config.target)
      ? (config.target as string[])
      : undefined;
    const outputPath =
      typeof config.outputPath === "string" ? config.outputPath : undefined;

    return {
      target,
      outputPath,
      globalCss,
      extensions: mergedExtensions,
      extend: extendArr,
      genExtend: genExtendArr,
    };
  } else {

    if (
      !config.target ||
      !Array.isArray(config.target) ||
      config.target.length === 0
    ) {
      throw new Error(
        "'target' must be a non-empty array in 'mantineReduceCss' configuration",
      );
    }

    if (!config.outputPath || typeof config.outputPath !== "string") {
      throw new Error(
        "'outputPath' must be a string in 'mantineReduceCss' configuration",
      );
    }

    return {
      target: config.target as string[],
      outputPath: config.outputPath,
      globalCss,
      extensions: mergedExtensions,
      extend: extendArr,
      genExtend: [],
    };
  }
}
