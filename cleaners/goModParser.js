const fs = require("fs");
const path = require("path");

const { cleanDataset } = require("./processDataset");

const GO_MOD_REQUIRE_REGEX = /\t([^ ]*) (.*)( \/\/ indirect)?\n/g;
function cleanGoMod(goModRaw) {
  for (let [package, version, indirect] of goModRaw.matchAll(
    GO_MOD_REQUIRE_REGEX
  ))
    console.log([package, version, indirect]);

  return goModRaw;
}

function main() {
  let rawDatasetPath = path.resolve(__dirname, "../dataset", "go");
  let cleanedDatasetPath = path.resolve(__dirname, "../cleaned_dataset", "go");
  cleanDataset(rawDatasetPath, cleanedDatasetPath, "go.mod", cleanGoMod);
}

if (require.main) main();
