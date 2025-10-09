import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { init, parse } from "es-module-lexer";
import { MANTINE_PACKAGE } from "../constant";
import hierarchy from "../hierarchy.json";
import type { Component, ComponentData } from "../types";
import type { ExtendConfig } from "./config";
import { ExtractFunctionNames } from "./function";

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
				const componentNames = ExtractFunctionNames(statement);
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
	componentMap: Map<string, ComponentData>;
	extendConfig: ExtendConfig[];
}
export function getComponentData(
	props: getAllDepComponentsProps,
): Map<string, ComponentData> {
	for (const ext of props.extendConfig) {
		try {
			const dataExt = readFileSync(ext.data, "utf-8");
			const extComponents = JSON.parse(dataExt);
			for (const comp of extComponents) {
				if (comp.name && comp.module) {
					props.componentMap.set(`${comp.module}/${comp.name}`, comp);
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
	componentMap: Map<string, ComponentData>,
) {
	const dependencies = new Set<Component>();

	function addDependencies(module: string, name: string, addSelf = false) {
		const data = componentMap.get(`${module}/${name}`);
		if (!data?.dependency) return;

		for (const dep of data.dependency) {
			dependencies.add({
				name: addSelf ? dep : dep,
				module: addSelf ? module : module,
			});
		}
	}

	function processDependency(dep: string) {
		const lastSlashIndex = dep.lastIndexOf("/");
		return {
			module: dep.substring(0, lastSlashIndex),
			name: dep.substring(lastSlashIndex + 1),
		};
	}

	for (const { module, name } of components) {
		if (MANTINE_PACKAGE.has(module)) {
			addDependencies(module, name, true);
		} else {
			const data = componentMap.get(`${module}/${name}`);
			if (data?.dependency) {
				for (const dep of data.dependency) {
					const { module: depModule, name: depName } = processDependency(dep);
					if (MANTINE_PACKAGE.has(depModule)) {
						addDependencies(depModule, depName, true);
					}
				}
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
