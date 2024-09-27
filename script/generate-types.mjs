import fs from "node:fs";
import path from "node:path";

import { compile, compileFromFile } from "json-schema-to-typescript";

const JSON_SCHEMAS_DIR =
  process.env.JSON_SCHEMAS_DIR ??
  "../django-peterbecom/peterbecom/json-schemas";

const FILENAME_TO_INTERFACE_NAME = {
  "api.v0.blogitem": "APIBlogitem",
  "api.v0.blogitems": "APIBlogitems",
};

main();
function main() {
  const dir = path.resolve(JSON_SCHEMAS_DIR);
  if (!fs.existsSync(dir)) {
    console.error(
      `The JSON_SCHEMAS_DIR environment variable must be set to a valid directory. Received: ${JSON_SCHEMAS_DIR}`
    );
    process.exit(1);
  }

  const files = getFiles(dir);
  processFiles(files);
}

function getFiles(dir) {
  const files = [];
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      files.push(...getFiles(res, files));
    } else if (dirent.name.endsWith(".json")) {
      files.push(res);
    }
  }
  return files;
}

function processFiles(files) {
  for (const file of files) {
    if (file.endsWith(".json")) {
      processFile(file);
    }
  }
}

function processFile(file) {
  // const schema = require(file);
  const name = path.basename(file).replace(/\.json$/, "");
  const interfaceName = FILENAME_TO_INTERFACE_NAME[name];
  if (!interfaceName) {
    throw new Error(
      `You have not defined what the interface name should be for '${name}' (from ${file})`
    );
  }
  let output = `// This file was generated by script/generate-types.mjs on ${new Date()}`;
  output += "\n\n";
  // const schema = JSON.parse(fs.readFileSync(file, "utf8"));
  // compileFromFile(file, { customName: (x) => x }).then((ts) => {
  compileFromFile(file).then((ts) => {
    console.log(ts);
  });

  console.log(output);
  // const name = file
  //   .replace(JSON_SCHEMAS_DIR, "")
  //   .replace(/\.json$/, "")
  //   .replace(/\//g, "-")
  //   .replace(/^\-/, "")
  //   .replace(/-$/, "")
  //   .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  // const interfaceName = FILENAME_TO_INTERFACE_NAME[name] ?? name;
  // const output = `// This file was generated by script/generate-types.mjs
}
