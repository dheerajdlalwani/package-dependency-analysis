const path = require("path");
const fs = require("fs");

let base_path = path.join(__dirname, "../dataset", "python");
let cleanDatasetPath = path.join(__dirname, "../cleaned_dataset", "python");

const getDirectories = (base_path) => {
  return fs
    .readdirSync(base_path, { withFileTypes: true })
    .filter((content) => content.isDirectory());
};

const getFiles = (base_path, directories, file_name) => {
  const files = {};
  for (let directory of directories) {
    let { name } = directory;
    files[name] = fs
      .readFileSync(path.join(base_path, name, file_name))
      .toString();
  }
  return files;
};

const getCleanedText = (text) => {
  let lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let keys = ["#", ";"];
    for (let key of keys) {
      if (lines[i].includes(key)) {
        let idx = lines[i].indexOf(key);
        lines[i] = lines[i].substring(0, idx);
      }
    }
  }

  return lines.join("\n").replace(/^\s*[\r\n]/gm, "");
};

const cleanedDataset = (files) => {
  for (let directory of Object.keys(files)) {
    let directory_path = path.join(cleanDatasetPath, directory);
    if (!fs.existsSync(directory_path))
      fs.mkdirSync(directory_path, { recursive: true });
    fs.writeFileSync(
      path.join(directory_path, "requirements.txt"),
      files[directory]
    );
  }
};

try {
  const directories = getDirectories(base_path);
  const files = getFiles(base_path, directories, "requirements.txt");
  for (const file of Object.keys(files)) {
    files[file] = getCleanedText(files[file]);
  }
  cleanedDataset(files);
} catch (err) {
  console.log(
    "Make Sure You have dataset/python directory (from the root directory)",
    err
  );
}
