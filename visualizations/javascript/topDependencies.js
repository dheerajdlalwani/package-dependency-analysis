const path = require("path");
const fs = require("fs");

const baseDir = path.resolve(__dirname, "../", "adjacencyList", "javaScript");
const fileName = "javaScript.csv";

const adjacencyList = fs
  .readFileSync(path.join(baseDir, fileName))
  .toString()
  .split("\n");
console.log(adjacencyList);

const degreeCount = new Map();
for (let tuple of adjacencyList) {
  let packages = tuple.split(",").map((str) => str.trim());
  if (!degreeCount.has(packages[0])) {
    degreeCount.set(
      packages[0],
      new Map().set("inDegree", 0).set("outDegree", 0)
    );
  }

  if (!degreeCount.has(packages[1])) {
    degreeCount.set(
      packages[1],
      new Map().set("inDegree", 0).set("outDegree", 0)
    );
  }
  degreeCount
    .get(packages[0])
    .set("outDegree", degreeCount.get(packages[0]).get("outDegree") + 1);
  degreeCount
    .get(packages[1])
    .set("inDegree", degreeCount.get(packages[1]).get("inDegree") + 1);
}

let text = "";

for (let [key, value] of degreeCount) {
  text += `${value.get("inDegree")},${key}\n`;
}

fs.writeFileSync(path.join(baseDir, "inDegree.csv"), text);
