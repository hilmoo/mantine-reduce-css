import { componentMap } from "../constant/data";

export function getCssForComponents(components: string[]): string {
    const cssImports = components
        .map(componentName => {
            const data = componentMap.get(componentName);
            if (data && data.css_name) {
                return `@import "${data.css_name}";`;
            }
            return null;
        })
        .filter(Boolean)
        .join("\n");

    return cssImports;
}