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
}

export interface ExtendConfig {
	package: string;
	data: string;
}

export interface GenerateConfig {
	target: string[];
	globalCss: boolean;
	outputPath: string;
	extensions: ExtensionsConfig;
	extend: ExtendConfig[];
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

interface parseConfigProps {
	configPath: string;
	configData: {
		[key: string]: unknown;
	};
}
export function parseGenerateConfig({
	configPath,
	configData,
}: parseConfigProps): GenerateConfig {
	const mantineReduceCss = configData.mantineReduceCss;
	if (!mantineReduceCss) {
		throw new Error("Missing 'mantineReduceCss' configuration in package.json");
	}

	const {
		target,
		outputPath,
		globalCss = true,
		extensions = {},
		extend,
	} = mantineReduceCss as Partial<GenerateConfig> & {
		extensions?: Partial<ExtensionsConfig>;
		extend?: ExtendConfig;
	};

	let extendArr: ExtendConfig[] = [];
	if (extend) {
		if (!Array.isArray(extend)) {
			throw new Error(
				"'extend' must be an array in 'mantineReduceCss' configuration",
			);
		}
		extendArr = extend.map((ext) => {
			const resolvedPath = path.resolve(path.dirname(configPath), ext.data);
			if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
				throw new Error(
					`'extend.data' must be a valid file path: ${resolvedPath}`,
				);
			}
			return { ...ext, data: resolvedPath };
		});
	}

	if (!target || !Array.isArray(target) || target.length === 0) {
		throw new Error(
			"'target' must be a non-empty array in 'mantineReduceCss' configuration",
		);
	}
	if (!outputPath || typeof outputPath !== "string") {
		throw new Error(
			"'outputPath' must be a string in 'mantineReduceCss' configuration",
		);
	}

	const mergedExtensions: ExtensionsConfig = {
		...defaultExtensions,
		...extensions,
	};

	return {
		target,
		outputPath,
		globalCss,
		extensions: mergedExtensions,
		extend: extendArr,
	};
}

export interface ExportConfig {
	packageName: string;
	target: string[];
	outputPath: string;
}
interface parseExportConfigProps {
	configData: {
		[key: string]: unknown;
	};
}
export function ParseExportConfig({
	configData,
}: parseExportConfigProps): ExportConfig {
	const mantineReduceCss = configData.mantineReduceCss;
	if (!mantineReduceCss) {
		throw new Error("Missing 'mantineReduceCss' configuration in package.json");
	}

	const { target, packageName, outputPath } =
		mantineReduceCss as Partial<ExportConfig>;
	if (!target || !Array.isArray(target) || target.length === 0) {
		throw new Error(
			"'target' must be a non-empty array in 'mantineReduceCss' configuration",
		);
	}

	if (!packageName || typeof packageName !== "string") {
		throw new Error(
			"'packageName' must be a string in 'mantineReduceCss' configuration",
		);
	}

	if (!outputPath || typeof outputPath !== "string") {
		throw new Error(
			"'outputPath' must be a string in 'mantineReduceCss' configuration",
		);
	}

	return {
		packageName,
		target,
		outputPath,
	};
}
