import { PackageJson } from "pkg-types";

export interface ExtensionsConfig {
    CodeHighlight: boolean;
    NotificationsSystem: boolean;
    Spotlight: boolean;
    Carousel: boolean;
    Dropzone: boolean;
    NavigationProgress: boolean;
    ModalsManager: boolean;
    RichTextEditor: boolean;
}

export interface Config {
    target: string[];
    globalCss: boolean;
    outputPath: string;
    extensions: ExtensionsConfig;
}

const defaultExtensions: ExtensionsConfig = {
    CodeHighlight: false,
    NotificationsSystem: false,
    Spotlight: false,
    Carousel: false,
    Dropzone: false,
    NavigationProgress: false,
    ModalsManager: false,
    RichTextEditor: false,
};

export function parseConfig(config: PackageJson): Config {
    const mantineReduceCss = config["mantineReduceCss"];
    if (!mantineReduceCss) {
        throw new Error("Missing 'mantineReduceCss' configuration in package.json");
    }

    const {
        target,
        outputPath,
        globalCss = true,
        extensions = {},
    } = mantineReduceCss as Partial<Config> & { extensions?: Partial<ExtensionsConfig> };

    if (!target || !Array.isArray(target) || target.length === 0) {
        throw new Error("'target' must be a non-empty array in 'mantineReduceCss' configuration");
    }
    if (!outputPath || typeof outputPath !== "string") {
        throw new Error("'outputPath' must be a string in 'mantineReduceCss' configuration");
    }

    const mergedExtensions: ExtensionsConfig = {
        ...defaultExtensions,
        ...extensions,
    };

    return { target, outputPath, globalCss, extensions: mergedExtensions };
}
