# mantine-reduce-css

A CLI tool to generate a reduced CSS bundle for your Mantine-based project by scanning your codebase for Mantine imports.

## Usage

```sh
$ npx mantine-reduce-css run [options]
```

- `--help`: Show help information

## Examples

Scan the current directory and output to `mantine.css`:

```sh
mantine-reduce-css run
```

Scan a specific directory and output to a custom file:

```sh
mantine-reduce-css run --in ./src --out custom-mantine.css
```

Only inclue `@mantine/dates` and `@mantine/notifications`:

```sh
mantine-reduce-css run --notification --dates
```

For more info, run:

```sh
mantine-reduce-css --help
```

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
