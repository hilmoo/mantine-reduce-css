import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { init, parse } from "es-module-lexer";
import hierarchy from "../hierarchy.json";
import type { Component, ComponentData } from "../types";
import type { ExtendConfig } from "./config";

/**
 * Extracts component names from a named import statement
 * Example: "{ Button, Text as CustomText }" -> ["Button", "Text"]
 */
function extractComponentNames(importStatement: string): string[] {
	const namedImportMatch = importStatement.match(/\{(.*?)\}/s);

	if (!namedImportMatch?.[1]) {
		return [];
	}

	return namedImportMatch[1]
		.split(",")
		.map((specifier) => specifier.trim())
		.filter(Boolean)
		.map((specifier) => specifier.split(" as ")[0].trim());
}

/**
 * Analyzes a file's imports and extracts components from the target package
 */
export async function extractImportsFromFile(
	filePath: string,
	targetPackage: Set<string>,
): Promise<Set<Component>> {
	await init;
	const components = new Set<Component>();

	try {
		const content = await readFile(filePath, "utf-8");
		const [imports] = parse(content);

		for (const imp of imports) {
			if (imp.n && targetPackage.has(imp.n)) {
				const moduleName = imp.n;
				const statement = content.substring(imp.ss, imp.se);
				const componentNames = extractComponentNames(statement);
				componentNames.forEach((name) => {
					components.add({ name, module: moduleName });
				});
			}
		}
	} catch (error) {
		console.error(`Could not process file: ${filePath}`, error);
	}

	return components;
}

interface getAllDepComponentsProps {
	componentMap: Map<Component, ComponentData>;
	extendConfig: ExtendConfig[];
}
export function getComponentData(
	props: getAllDepComponentsProps,
): Map<Component, ComponentData> {
	for (const ext of props.extendConfig) {
		try {
			const dataExt = readFileSync(ext.data, "utf-8");
			const extComponents = JSON.parse(dataExt);
			for (const comp of extComponents) {
				if (comp.name && comp.module) {
					props.componentMap.set(
						{ name: comp.name, module: comp.module },
						comp,
					);
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
	componentMap: Map<Component, ComponentData>,
) {
	const dependencies = new Set<Component>();

	for (const componentName of components) {
		const data = componentMap.get({
			name: componentName.name,
			module: componentName.module,
		});

		if (data?.dependency) {
			for (const dep of data.dependency) {
				dependencies.add({ name: dep, module: componentName.module });
			}
		}
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
