import os
import re
import json


def list_mantine_component(
    base_dir: str,
    parent_dir: str,
):
    abs_base_dir = os.path.abspath(base_dir)
    components_dict = {}
    css_file = set()

    with open(os.path.join(parent_dir, "scripts", "all.json"), "r") as f:
        data = json.load(f)
        for item in data:
            if "component" in item:
                css_file.add(item["component"])

    for entry in os.listdir(abs_base_dir):
        full_path = os.path.join(abs_base_dir, entry)
        if os.path.isdir(full_path):
            component_name = os.path.basename(full_path)
            tsx_path = os.path.join(full_path, f"{component_name}.tsx")
            if not os.path.isfile(tsx_path):
                continue
            dependency = list(extract_dependency_import(tsx_path, 1))

            if component_name in css_file:
                css_name = f"@mantine/core/styles/{component_name}.css"

            if component_name not in components_dict:
                components_dict[component_name] = {
                    "name": component_name,
                    "module": "@mantine/core",
                    "css_name": f"@mantine/core/styles/{component_name}.css",
                    "dependency": set(dependency),
                }
            else:
                components_dict[component_name]["dependency"].update(dependency)

            for subentry in os.listdir(full_path):
                sub_path = os.path.join(full_path, subentry)
                if os.path.isdir(sub_path):
                    sub_tsx_path = os.path.join(sub_path, f"{subentry}.tsx")
                    if os.path.isfile(sub_tsx_path):
                        sub_dependency = list(
                            extract_dependency_import(sub_tsx_path, 2)
                        )
                        components_dict[component_name]["dependency"].update(
                            sub_dependency
                        )

    components = []
    for comp in components_dict.values():
        comp["dependency"] = list(comp["dependency"])
        components.append(comp)

    return components


def extract_dependency_import(file_path: str, depth: int) -> list[str]:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    if depth == 1:
        # Matches: import ... from '../Component';
        pattern = re.compile(
            r"import\s+(?:\{[^}]*\}\s+|[\w*]+(?:\s*,\s*\{[^}]*\})?\s+)?from\s+['\"]\.\./([\w\d_]+)['\"]",
            re.MULTILINE,
        )
    elif depth == 2:
        # Matches: import ... from '../../Component';
        pattern = re.compile(
            r"import\s+(?:\{[^}]*\}\s+|[\w*]+(?:\s*,\s*\{[^}]*\})?\s+)?from\s+['\"]\.\./\.\./([\w\d_]+)['\"]",
            re.MULTILINE,
        )
    else:
        return []
    matches = pattern.findall(content)
    return matches
