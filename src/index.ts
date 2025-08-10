#!/usr/bin/env node

import { extractMantineImports } from "./getimport";
import { cac } from "cac";
import { generateCssFiles } from "./generate";

const cli = cac("mantine-reduce-css");

cli
  .command("run", "Run Mantine CSS reduction")
  .option("--in <dir>", "Directory to scan for Mantine imports", {
    default: "./src",
  })
  .option("--out <file>", "Output file to save the result", {
    default: "mantine.css",
  })
  .option("--core", "Scan <dir> for @mantine/core packages", {
    default: true,
  })
  .option("--dates", "Scan <dir> for @mantine/dates packages", {
    default: false,
  })
  .option("--charts", "Scan <dir> for @mantine/charts packages", {
    default: false,
  })
  .option("--base", "Include Mantine global CSS in the output file", {
    default: true,
  })
  .option(
    "--code_highlight",
    "Include @mantine/code-highlight CSS in the output file",
    {
      default: false,
    }
  )
  .option(
    "--notification",
    "Include @mantine/notifications CSS in the output file",
    {
      default: false,
    }
  )
  .option("--spotlight", "Include @mantine/spotlight CSS in the output file", {
    default: false,
  })
  .option("--carousel", "Include @mantine/carousel CSS in the output file", {
    default: false,
  })
  .option("--dropzone", "Include @mantine/dropzone CSS in the output file", {
    default: false,
  })
  .option("--nprogress", "Include @mantine/nprogress CSS in the output file", {
    default: false,
  })
  .option("--tiptap", "Include @mantine/tiptap CSS in the output file", {
    default: false,
  })
  .option("--modals", "Include Mantine modals manager CSS in the output file", {
    default: false,
  })
  .option("--ext <extension>", "File extension to scan for Mantine imports", {
    default: ["tsx", "jsx"],
  })
  .action((options) => {
    const data = extractMantineImports({
      directory: options.in,
      code_highlight: options.code_highlight,
      notification: options.notification,
      spotlight: options.spotlight,
      carousel: options.carousel,
      dropzone: options.dropzone,
      nprogress: options.nprogress,
      dates: options.dates,
      charts: options.charts,
      core: options.core,
      tiptap: options.tiptap,
      modals: options.modals,
      extensions: options.ext,
    });

    generateCssFiles(data, options.out, options.base);
  });

cli.help();
cli.parse();
