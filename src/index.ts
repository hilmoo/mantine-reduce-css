#!/usr/bin/env node

import { extractMantineImports } from "./getimport";
import { cac } from "cac";
import { generateCssFiles } from "./generate";

const cli = cac("mantine-reduce-css");

cli
  .command("[dir]", "Directory to scan for Mantine imports")
  .option("--out <file>", "Output file to save the results", {
    default: "mantine.css",
  })
  .option("--base", "Include Mantine global imports", {
    default: true,
  })
  .option("--core", "Include Mantine core imports", { default: true })
  .option("--code_highlight", "Include Mantine code highlight imports", {
    default: false,
  })
  .option("--notification", "Include Mantine notification imports", {
    default: false,
  })
  .option("--spotlight", "Include Mantine spotlight imports", {
    default: false,
  })
  .option("--carousel", "Include Mantine carousel imports", {
    default: false,
  })
  .option("--dropzone", "Include Mantine dropzone imports", {
    default: false,
  })
  .option("--nprogress", "Include Mantine navigationprogress imports", {
    default: false,
  })
  .option("--dates", "Include Mantine dates imports", { default: false })
  .option("--charts", "Include Mantine charts imports", { default: false })
  .action((dir, options) => {
    const data = extractMantineImports({
      directory: dir,
      code_highlight: options.code_highlight,
      notification: options.notification,
      spotlight: options.spotlight,
      carousel: options.carousel,
      dropzone: options.dropzone,
      nprogress: options.nprogress,
      dates: options.dates,
      charts: options.charts,
      core: options.core,
    });
    generateCssFiles(data, options.out, options.base);
  });

cli.help();
cli.parse();
