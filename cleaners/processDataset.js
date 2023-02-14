const fs = require("fs");
const path = require("path");

function loadDatasetFiles(basedir, file) {
  return fs
    .readdirSync(basedir, { withFileTypes: true })
    .filter((folder) => folder.isDirectory())
    .map(({ name }) => {
      let relativePath = path.join(name, file);
      let file = fs.readFileSync(path.join(basedir, relativePath)).toString();
      return { relativePath, file };
    });
}

function cleanDataset(
  rawDatasetPath,
  cleanDatasetPath,
  file,
  cleaningFunction
) {
  let rawDataset = loadDatasetFiles(rawDatasetPath, file);

  let cleanDataset = rawDataset.map(({ file, ...rest }) => ({
    file: cleaningFunction(file),
    ...rest,
  }));
  for (let { relativePath, packageJson } of cleanDataset) {
    let filePath = path.join(cleanDatasetPath, relativePath);
    let fileDir = path.dirname(packageJsonPath);
    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
    fs.writeFileSync(filePath, file);
  }
}

module.exports = {
  loadDatasetFiles,
  cleanDataset,
};
