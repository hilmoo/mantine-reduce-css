# mantine-reduce-css

A CLI tool designed to optimize your production build by generating a reduced Mantine CSS bundle. It scans your project files to detect which components are actually used and generates a CSS file containing only the necessary styles.

## Version Compatibility

Since version 2, this package aligns with Mantine's minor versioning to ensure compatibility.

| mantine-reduce-css | @mantine/core |
| :----------------- | :------------ |
| `2.3.x`            | `8.3.x`       |
| `2.4.x`            | `8.4.x`       |
| `3.0.x`            | `9.0.x`       |

## Installation

You can install the tool globally or as a dev dependency in your project.

```sh
npm install -g mantine-reduce-css
```

## Usage

Run the following command in your terminal to generate the CSS file. By default, the tool looks for configuration in your `package.json`.

```bash
mantine-reduce-css --config <path-to-config>
```

### Configuration

Add a mantineReduceCss section to your `package.json` or create a standalone JSON configuration file.

#### Example Configuration

```json
{
  "mantineReduceCss": {
    "target": ["src/**/*.tsx"],
    "globalCss": true,
    "outputPath": "mantine.css",
    "extensions": {
      "CodeHighlight": false,
      "NotificationsSystem": false,
      "Spotlight": false,
      "Carousel": false,
      "Dropzone": false,
      "NavigationProgress": false,
      "ModalsManager": false,
      "RichTextEditor": false,
      "Schedule": false
    },
    "extend": []
  }
}
```

### Options Reference

| Option     | Type     | Required | Description                                                                                              |
| ---------- | -------- | -------- | -------------------------------------------------------------------------------------------------------- |
| target     | string[] | Yes      | An array of glob patterns (e.g., `src/**/*.tsx`) to scan for Mantine imports.                            |
| outputPath | string   | Yes      | The file path where the generated CSS will be written.                                                   |
| globalCss  | boolean  | No       | Whether to include Mantine's global reset and base styles. Default: `true`.                              |
| extensions | object   | No       | Enable specific Mantine extension packages (e.g., Carousel, Dropzone). All default to `false`.           |
| extend     | object[] | No       | An array of configurations for custom/shared component libraries. See *Handling Custom Libraries* below. |

## Handling Custom Libraries (Extend)

If you use a shared component library (e.g., an internal design system) that relies on Mantine, mantine-reduce-css needs to know which Mantine components your shared library uses.

### Method 1: Automatic Generation

You can automatically generate the map if your library meets these constraints:

1. Filename matches Component Name (e.g., Button.tsx exports Button).
2. No Deep Dependencies (it implies the component directly imports Mantine, not via another wrapper).

In your shared library project, configure genExtend to scan your library's components and output a JSON map.

#### Run the generation command

```bash
mantine-reduce-css gen --config <path-to-config>
```

#### Configuration for generation

```json
{
  "mantineReduceCss": {
    "genExtend": [
      {
        "target": ["src/components/**/*.tsx"],
        "outputPath": "exported-components.json",
        "packageName": "@custom/ui"
      }
    ]
  }
}
```

### Method 2: Manual Mapping

If your library does not meet the constraints above (e.g., it uses deep nesting or mismatched filenames), automatic generation will fail to detect usage. You must manually create the JSON map:

```json
[
  {
    "name": "CustomButton",
    "module": "@custom/ui",
    "dependency": [
      "@mantine/core/Stack",
      "@mantine/core/Button"
    ]
  }
]
```

### Consume Component Map

In your main application (where you are generating the final CSS), point the extend option to the JSON file created in the previous step (Method 1 or Method 2).

```json
{
  "mantineReduceCss": {
    "target": ["src/**/*.tsx"],
    "outputPath": "styles/mantine.css",
    "extend": [
      {
        "package": "@custom/ui",
        "data": "./node_modules/@custom/ui/exported-components.json"
      }
    ]
  }
}
```

## License

MIT
