const fs = require("fs");
const path = require("path");

const fileBasePath = path.resolve(
  __dirname,
  "../",
  "visualizations",
  "data",
  "javaScript"
);
const filePath = "javaScript.csv";

const getAllPackages = (filePath) => {
  const file = fs.readFileSync(filePath).toString().split("\n");
  const packages = new Set();
  for (let tuple of file) {
    const packageList = tuple.split(",").map((p) => p.trim());
    if (packageList.length == 1) continue;
    packages.add(packageList[0]);
    packages.add(packageList[1]);
  }

  return packages;
};

const getVersionsAndDates = async () => {
  const packages = getAllPackages(path.join(fileBasePath, filePath));
  const url = "https://registry.npmjs.org/";
  const data = {};
  let i = 0;
  let len = new Array(...packages).length;
  for (let package of packages) {
    const request = await fetch(url + package);
    if (!request.status.toString().startsWith("2")) continue;
    const json = await request.json();
    data[package] = {};
    data[package]["name"] = json.name;
    data[package]["description"] = json.description;
    data[package]["time"] = json.time;
    data[package]["maintainers"] = {};
    if (json.versions) {
      for (let version of Object.keys(json.versions)) {
        data[package]["maintainers"][version] =
          json["versions"][version]["maintainers"];
      }
    }
    console.log("Package done: " + package);
    console.log(`Total ${i} of ${len} done`);
    i++
  }
  return data;
};

const main = async () => {
  const a = await getVersionsAndDates();
  const baseDir = path.resolve(
    __dirname,
    "../visualizations",
    "data",
    "javaScript"
  );
  fs.mkdirSync(baseDir, { recursive: true });
  fs.writeFileSync(path.join(baseDir, "packages-data.json"), JSON.stringify(a, null, 2));
};

main();
