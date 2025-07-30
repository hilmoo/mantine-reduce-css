import os
import json
import shutil
from collections import defaultdict, deque

from core import list_mantine_component
from ext import flat, tree, flat_tree


def build_dependency_graph(components):
    graph = {}
    for comp in components:
        name = comp["name"]
        deps = comp.get("dependency", [])
        graph[name] = set(deps)
    return graph


def topological_sort(graph):
    # Build reverse graph (who depends on me)
    reverse_graph = defaultdict(set)
    indegree = {node: 0 for node in graph}
    for node, deps in graph.items():
        for dep in deps:
            if dep in graph:
                reverse_graph[dep].add(node)
                indegree[node] += 1

    # Nodes with no incoming edges (highest)
    queue = deque([node for node, deg in indegree.items() if deg == 0])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)
        for dependent in reverse_graph[node]:
            indegree[dependent] -= 1
            if indegree[dependent] == 0:
                queue.append(dependent)
    # If result doesn't contain all nodes, there is a cycle
    if len(result) != len(graph):
        raise Exception("Cycle detected in dependencies")
    return result


if __name__ == "__main__":
    current_file = os.path.abspath(__file__)
    parent_dir = os.path.dirname(os.path.dirname(current_file))
    src_dir = os.path.join(parent_dir, "src")
    mantine_root = os.path.join(parent_dir, "mantine", "packages", "@mantine")

    full_components = []
    full_hierarchy = []

    # Mantine Core Component
    dir = os.path.join(mantine_root, "core", "src", "components")
    components = list_mantine_component(dir, parent_dir)
    full_components.extend(components)

    non_core = set(comp["name"] for comp in components)

    # Mantine Ext Dates
    dir = os.path.join(mantine_root, "dates", "src", "components")
    components = tree(dir, "@mantine/dates", "@mantine/dates/styles.css", non_core)
    full_components.extend(components)

    # Mantine Ext Chart
    dir = os.path.join(mantine_root, "charts", "src")
    components = tree(dir, "@mantine/charts", "@mantine/charts/styles.css", non_core)
    full_components.extend(components)

    # Mantine Ext Tiptap
    dir = os.path.join(mantine_root, "tiptap", "src")
    components = flat_tree(dir, "@mantine/tiptap", "@mantine/tiptap/styles.css", non_core)
    full_components.extend(components)

    # Mantine Ext CodeHighlight
    dir = os.path.join(mantine_root, "code-highlight")
    components = flat_tree(
        dir, "@mantine/code-highlight", "@mantine/code-highlight/styles.css", non_core
    )
    full_components.extend(components)

    # Mantine Ext Notification System
    dir = os.path.join(mantine_root, "notifications")
    components = flat(
        dir, "@mantine/notifications", "@mantine/notifications/styles.css", non_core
    )
    full_components.extend(components)

    # Mantine Ext Spotlight
    dir = os.path.join(mantine_root, "spotlight")
    components = flat(
        dir, "@mantine/spotlight", "@mantine/spotlight/styles.css", non_core
    )
    full_components.extend(components)

    # Mantine Ext Carousel
    dir = os.path.join(mantine_root, "carousel")
    components = flat(
        dir, "@mantine/carousel", "@mantine/carousel/styles.css", non_core
    )
    full_components.extend(components)

    # Mantine Ext Dropzone
    dir = os.path.join(mantine_root, "dropzone")
    components = flat(
        dir, "@mantine/dropzone", "@mantine/dropzone/styles.css", non_core
    )
    full_components.extend(components)

    # Mantine Ext NavigationProgress
    dir = os.path.join(mantine_root, "nprogress")
    components = flat(
        dir, "@mantine/nprogress", "@mantine/nprogress/styles.css", non_core
    )
    full_components.extend(components)

    graph = build_dependency_graph(full_components)
    hierarchy = topological_sort(graph)
    full_hierarchy.extend(hierarchy)

    with open("hierarchy.json", "w", encoding="utf-8") as f:
        json.dump(full_hierarchy, f, indent=2, ensure_ascii=False)
    with open("data.json", "w", encoding="utf-8") as f:
        json.dump(full_components, f, indent=2, ensure_ascii=False)

    shutil.move("hierarchy.json", os.path.join(src_dir, "hierarchy.json"))
    shutil.move("data.json", os.path.join(src_dir, "data.json"))
