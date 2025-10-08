import componentData from "../data.json";

export const componentMap = new Map(componentData.map(c => [c.name, c]));