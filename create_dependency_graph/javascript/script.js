const fs = require("fs");
const path = require("path");

const adjacencyList = new Map();
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
  if (!adjacencyList[fileName]) {
    adjacencyList[fileName] = new Array();
  }
  for(let key of fileKeys) {
    if(!file[key] || !file[key]["dependencies"]) break;
    let keyContent = Object.keys(file[key]["dependencies"]);
    for(let content of keyContent) {
      if(typeof adjacencyList[fileName] === 'object' && !adjacencyList[fileName].includes(content)) {
        adjacencyList[fileName].push(content);
        dfs(ogFile, content);
      }
    }
  }
  return;
};

const getAdjacencyList = (baseDir) => {
  const files = getFileContents(baseDir);
  const keys = Object.keys(files);
  for (let key of keys) {
    adjacencyList[key] = new Array();
    const file = files[key];
    const dependencyList = getSpecifiedDependencies(file);
    const devDependencyList = getSpecifiedDependencies(file, "dev");
    adjacencyList[key] = [
      ...adjacencyList[key],
      ...dependencyList,
      ...devDependencyList,
    ];

    for (let dependency of adjacencyList[key]) {
      dfs(file, dependency);
    }

  }

};

const getTemp = () => {
  let keys = Object.keys(adjacencyList);
  for(let key of keys) {
    let edges = adjacencyList[key];
    for(let edge of edges) {
      temp += `${key}>${edge}\n`;
    }
  }
}

let temp = "";
getAdjacencyList(baseDir);
getTemp()
console.log(temp)

