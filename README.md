# mantine-reduce-css

A CLI tool to generate a reduced CSS bundle for your Mantine-based project by scanning your codebase for Mantine imports.

> [!NOTE]
> This package supports Mantine v8.1.0 and above (it probably works with earlier versions, but is not tested).
> The current mantine version is `8.1.3`.

## Usage

```sh
$ npx mantine-reduce-css run [options]
```

- `--help`: Show help information

## Examples

Scan the `./src` directory and output to `mantine.css`:

```sh
mantine-reduce-css run
```

Scan a specific directory and output to a custom file:

```sh
mantine-reduce-css run --in ./app --out custom-mantine.css
```

Only inclue `@mantine/dates` and `@mantine/notifications`:

```sh
mantine-reduce-css run --notification --dates --core false --base false
```

For more info, run:

```sh
mantine-reduce-css run --help
```

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
