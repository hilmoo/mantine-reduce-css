import componentData from "../data.json";

export function getCssForComponents(components: string[]): string {
    const componentMap = new Map(componentData.map((c) => [c.name, c]));
    const cssUsed = new Set<string>();
    components.forEach(c => {
        const data = componentMap.get(c);
        if (data?.css_name) {
            cssUsed.add(data.css_name);
        }
    });

    const cssImports = Array.from(cssUsed)
        .map((cssName) => `@import "${cssName}";`)
        .join("\n");

    return cssImports;
}
