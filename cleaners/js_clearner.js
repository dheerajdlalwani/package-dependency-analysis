const fs = require("fs");
const path = require("path");

const { cleanDataset } = require("./processDataset");

const KEEP_PACKAGE_JSON_KEYS = new Set([
  "name",
  "version",
  "dependencies",
  "devDependencies",
]);
function cleanPackageJson(packageJsonBuffer) {
  let packageJson = JSON.parse(packageJsonBuffer);
  let cleanedPackageJson = Object.fromEntries(
    Object.entries(packageJson).filter(([key]) =>
      KEEP_PACKAGE_JSON_KEYS.has(key)
    )
  );
  return JSON.stringify(cleanedPackageJson, null, 2);
}

function main() {
  let rawDatasetPath = path.resolve(__dirname, "../dataset", "javascript");
  let cleanedDatasetPath = path.resolve(
    __dirname,
    "../cleaned_dataset",
    "javascript"
  );
  cleanDataset(
    rawDatasetPath,
    cleanedDatasetPath,
    "package.json",
    cleanPackageJson
  );
}

if (require.main) console.log(main());
