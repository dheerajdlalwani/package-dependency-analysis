const fs = require("fs");
const path = require("path");

//"", "package.json"
function loadDatasetFiles(basedir, file) {
  return (
    fs
      .readdirSync(basedir, { withFileTypes: true })
      .filter((folder) => folder.isDirectory())
      //folder name: xyz
      .map(({ name }) => {
        // xyz/package.json
        let relativePath = path.join(name, file);
        //
        let fileData = fs
          .readFileSync(path.join(basedir, relativePath))
          .toString();
        return { relativePath, file: fileData };
      })
  );
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
  for (let { relativePath, file } of cleanDataset) {
    // cleaned_dataset/javaScript/xyz/package.json
    let filePath = path.join(cleanDatasetPath, relativePath);
    let fileDir = path.dirname(filePath);
    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
    fs.writeFileSync(filePath, file);
  }
}

module.exports = {
  loadDatasetFiles,
  cleanDataset,
};
