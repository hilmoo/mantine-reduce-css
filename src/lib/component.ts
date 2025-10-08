import { parse } from "es-module-lexer";
import { readFile } from "fs/promises";
import hierarchy from "../hierarchy.json";
import { componentMap } from "../constant/data";


/**
 * Extracts component names from a named import statement
 * Example: "{ Button, Text as CustomText }" -> ["Button", "Text"]
 */
function extractComponentNames(importStatement: string): string[] {
    const namedImportMatch = importStatement.match(/\{(.*?)\}/);

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
): Promise<Set<string>> {
    const components = new Set<string>();

    try {
        const content = await readFile(filePath, "utf-8");
        const [imports] = parse(content);

        for (const imp of imports) {
            if (imp.n && targetPackage.has(imp.n)) {
                const statement = content.substring(imp.ss, imp.se);
                const componentNames = extractComponentNames(statement);
                componentNames.forEach((name) => components.add(name));
            }
        }
    } catch (error) {
        console.error(`Could not process file: ${filePath}`, error);
    }

    return components;
}

export function getDependencyComponents(components: Set<string>) {
    const dependencies = new Set<string>();

    for (const componentName of components) {
        const data = componentMap.get(componentName);

        if (data && data.dependency) {
            for (const dep of data.dependency) {
                dependencies.add(dep);
            }
        }
    }

    return dependencies;
}

export function sortComponents(components: Set<string>): string[] {
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