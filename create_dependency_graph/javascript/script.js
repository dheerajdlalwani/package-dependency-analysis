const fs = require("fs");
const path = require("path");

const adjacencyMap = new Map();
const baseDir = path.join(__dirname, "../../dataset/javascript");

const getDirectories = (baseDir) => {
  const folders = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((dir) => dir.isDirectory())
    .map((dir) => dir.name);

  return folders;
};

const getFileContents = (baseDir) => {
  const directories = getDirectories(baseDir);
  const files = new Map();
  for (let directory of directories) {
    const dir = path.join(baseDir, directory, "package-lock.json");
    const file = fs.readFileSync(dir);
    const fileJson = JSON.parse(file);
    if (fileJson["lockfileVersion"] && fileJson["lockfileVersion"] === 2) {
      files[directory] = fileJson;
    }
  }
  return files;
};

const getSpecifiedDependencies = (file, which = "dependency") => {
  let type = "devDependencies";
  if (which.toLowerCase() === "dependency") {
    type = "dependencies";
  }
  if (file["packages"] && file["packages"][""] && file["packages"][""][type]) {
    return Object.keys(file["packages"][""][type]);
  }
  return new Array();
};

const dfs = (file, fileName) => {
  const ogFile = file;
  file = file["packages"];
  const expression = `^node_modules\/.*?${fileName}$`;
  const regEx = new RegExp(expression, "gm");
  const fileKeys = Object.keys(file).filter((val) => regEx.test(val));
  if (!adjacencyMap[fileName]) {
    adjacencyMap[fileName] = new Array();
  }
  for (let key of fileKeys) {
    if (!file[key] || !file[key]["dependencies"]) break;
    let keyContent = Object.keys(file[key]["dependencies"]);
    for (let content of keyContent) {
      if (
        typeof adjacencyMap[fileName] === "object" &&
        !adjacencyMap[fileName].includes(content)
      ) {
        adjacencyMap[fileName].push(content);
        dfs(ogFile, content);
      }
    }
  }
  return;
};

const getAdjacencyMap = (baseDir) => {
  const files = getFileContents(baseDir);
  const keys = Object.keys(files);
  for (let key of keys) {
    adjacencyMap[key] = new Array();
    const file = files[key];
    const dependencyList = getSpecifiedDependencies(file);
    // const devDependencyList = getSpecifiedDependencies(file, "dev");
    adjacencyMap[key] = [
      ...adjacencyMap[key],
      ...dependencyList,
      // ...devDependencyList,
    ];

    for (let dependency of adjacencyMap[key]) {
      dfs(file, dependency);
    }
  }
};

const getAdjacencyList = () => {
  let keys = Object.keys(adjacencyMap);
  for (let key of keys) {
    let edges = adjacencyMap[key];
    for (let edge of edges) {
      adjacencyList += `${key},${edge}\n`;
    }
  }
};

const createCsv = (savingDirectory, fileName) => {
  fs.mkdirSync(savingDirectory, { recursive: true });
  fs.writeFileSync(path.join(savingDirectory, fileName), adjacencyList);
};

let adjacencyList = "";
getAdjacencyMap(baseDir);
getAdjacencyList();

const savingDirectory = path.join(
  __dirname,
  "../",
  "adjacencyList",
  "javaScript.csv"
);
createCsv(savingDirectory, "javaScript.csv");
