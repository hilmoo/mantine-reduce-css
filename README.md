# mantine-reduce-css

A CLI tool for generating reduced Mantine CSS bundles based on your project’s component usage.

## Installation

```sh
npm install -g mantine-reduce-css
```

## Mantine Version

Since version 2, this package follows Mantine's minor version updates.
Example: `mantine-reduce-css@2.3.x` is compatible with `@mantine/core@8.3.x`.

## Usage

### Generate Reduced CSS

```sh
mantine-reduce-css --config <path-to-config>
```

### Export Component Data

To export component data for custom packages, use:

```sh
mantine-reduce-css gen --config <path-to-config>
```

## Configuration

Add a `mantineReduceCss` section to your config file (e.g., `package.json` or a separate JSON file):

```json
{
  "mantineReduceCss": {
    "target": [
      "src/**/*.tsx"
    ],
    "globalCss": true,
    "extensions": {
      "CodeHighlight": false,
      "NotificationsSystem": false,
      "Spotlight": false,
      "Carousel": false,
      "Dropzone": false,
      "NavigationProgress": false,
      "ModalsManager": false,
      "RichTextEditor": false
    },
    "outputPath": "mantine.css",
    "extend": [
      {
        "package": "@custom",
        "data": "custom-components.json"
      }
    ]
  }
}
```

### Options

- **target**: Array of glob patterns for files to scan for Mantine imports (required)
- **globalCss**: Include Mantine global CSS (default: true)
- **extensions**: Enable Mantine extension packages (all default to false)
- **outputPath**: Path to write the generated CSS file (required)
- **extend**: Array of objects to extend with custom component data (optional)
  - **package**: Name of the custom package
  - **data**: Path to a JSON file containing exported component data

### Export Config

For exporting component data, use:

```json
{
  "mantineReduceCss": {
    "target": [
      "src/components/**/*.tsx"
    ],
    "outputPath": "exported-components.json",
    "packageName": "@custom"
  }
}
```

## Example

To generate CSS for your project:

```sh
mantine-reduce-css --config test/test-simple.json
```

To export component data:

```sh
mantine-reduce-css gen --config test/test-export.json
```

## License

MIT