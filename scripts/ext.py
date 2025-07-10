import os
import re


def extract_dependency_import(file_path: str, depth: int) -> list[str]:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = re.compile(
        r"import\s+(?:\{[^}]*\}\s+|[\w*]+(?:\s*,\s*\{[^}]*\})?\s+)?from\s+['\"]@mantine/core['\"]",
        re.MULTILINE,
    )
    matches = []
    for match in pattern.finditer(content):
        import_clause = match.group(0)
        imported = re.findall(r"import\s+\{([^}]+)\}", import_clause)
        if imported:
            names = [name.strip() for name in imported[0].split(",")]
            matches.extend(names)
    return matches


def flat(base_dir: str, component_name: str, css_name: str, non_core: set[str]):
    abs_base_dir = os.path.abspath(base_dir)
    components_dict = {}

    for entry in os.listdir(abs_base_dir):
        full_path = os.path.join(abs_base_dir, entry)
        if os.path.isdir(full_path):
            found_files = []
            for file in os.listdir(full_path):
                if (
                    file.endswith(".tsx")
                    and not file.endswith(".test.tsx")
                    and not file.endswith(".story.tsx")
                ):
                    found_files.append(os.path.join(full_path, file))

            if not found_files:
                continue

            dependencies = set()
            for tsx_path in found_files:
                dependency = [
                    dep
                    for dep in extract_dependency_import(tsx_path, 1)
                    if dep in non_core
                ]
                dependencies.update(dependency)

            if component_name not in components_dict:
                components_dict[component_name] = {
                    "name": component_name,
                    "module": component_name,
                    "css_name": css_name,
                    "dependency": dependencies,
                }
            else:
                components_dict[component_name]["dependency"].update(dependencies)

    components = []
    for comp in components_dict.values():
        comp["dependency"] = list(comp["dependency"])
        components.append(comp)

    return components


def tree(base_dir: str, lib: str, css_name: str, non_core: set[str]):
    abs_base_dir = os.path.abspath(base_dir)
    components_dict = {}

    for entry in os.listdir(abs_base_dir):
        full_path = os.path.join(abs_base_dir, entry)
        if os.path.isdir(full_path):
            component_name = os.path.basename(full_path)
            tsx_path = os.path.join(full_path, f"{component_name}.tsx")
            if not os.path.isfile(tsx_path):
                continue
            dependency = set(
                dep for dep in extract_dependency_import(tsx_path, 1) if dep in non_core
            )

            if component_name not in components_dict:
                components_dict[component_name] = {
                    "name": component_name,
                    "module": lib,
                    "css_name": css_name,
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


def flat_tree(base_dir: str, lib: str, css_name: str, non_core: set[str]):
    abs_base_dir = os.path.abspath(base_dir)
    dependencies = set()

    for entry in os.listdir(abs_base_dir):
        full_path = os.path.join(abs_base_dir, entry)
        if os.path.isdir(full_path):
            component_name = os.path.basename(full_path)
            tsx_path = os.path.join(full_path, f"{component_name}.tsx")
            if os.path.isfile(tsx_path):
                deps = [dep for dep in extract_dependency_import(tsx_path, 1) if dep in non_core]
                dependencies.update(deps)

            for subentry in os.listdir(full_path):
                sub_path = os.path.join(full_path, subentry)
                if os.path.isdir(sub_path):
                    sub_tsx_path = os.path.join(sub_path, f"{subentry}.tsx")
                    if os.path.isfile(sub_tsx_path):
                        sub_deps = extract_dependency_import(sub_tsx_path, 2)
                        dependencies.update([dep for dep in sub_deps if dep in non_core])

    component = {
        "name": lib,
        "module": lib,
        "css_name": css_name,
        "dependency": list(dependencies),
    }
    return [component]
