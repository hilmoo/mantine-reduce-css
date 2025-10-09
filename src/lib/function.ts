/**
 * Extracts function names from a named import statement
 * Example: "{ Button, Text as CustomText }" -> ["Button", "Text"]
 */
export function ExtractFunctionNames(importStatement: string): string[] {
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
